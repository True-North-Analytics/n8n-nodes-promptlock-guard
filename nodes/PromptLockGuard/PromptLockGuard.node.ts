import type {
	IExecuteFunctions,
	IDataObject,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	IHttpRequestOptions,
} from 'n8n-workflow';
import { NodeApiError, NodeOperationError } from 'n8n-workflow';

export class PromptLockGuard implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'PromptLock Guard',
		name: 'promptLockGuard',
		icon: 'file:promptlock.svg',
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["textField"]}} → {{$parameter["frameworks"].join(", ")}}',
		description:
			'AI-powered guardrail that analyzes, redacts, or blocks content based on compliance frameworks',
		defaults: {
			name: 'PromptLock Guard',
			color: '#2E86C1',
		},
		credentials: [
			{
				name: 'promptLockApiKey',
				required: true,
				displayOptions: {
					show: {},
				},
			},
		],
		inputs: ['main'] as any,
		outputs: ['main', 'main', 'main', 'main'] as any,
		outputNames: ['✅ Allow', '⚠️ Flag', '🔒 Redact', '🚫 Block'],
		properties: [
			{
				displayName: 'Text Field',
				name: 'textField',
				type: 'string',
				default: 'text',
				placeholder: 'text, payload.message, data.description',
				description: 'Path to the field containing text to analyze (supports dot notation)',
				required: true,
				noDataExpression: false,
			},
			{
				displayName: 'Compliance Frameworks',
				name: 'frameworks',
				type: 'multiOptions',
				options: [
					{
						name: 'HIPAA (Healthcare)',
						value: 'HIPAA',
						description: 'Health Insurance Portability and Accountability Act',
					},
					{
						name: 'GDPR (Privacy)',
						value: 'GDPR',
						description: 'General Data Protection Regulation',
					},
					{
						name: 'PCI (Payment)',
						value: 'PCI',
						description: 'Payment Card Industry Data Security Standard',
					},
				],
				default: ['HIPAA', 'GDPR', 'PCI'],
				required: true,
				description: 'Select which compliance frameworks to check against',
			},
			{
				displayName: 'Additional Settings',
				name: 'additionalSettings',
				type: 'collection',
				placeholder: 'Add Setting',
				default: {},
				options: [
					{
						displayName: 'Action on High Risk',
						name: 'actionOnHighRisk',
						type: 'options',
						options: [
							{
								name: 'Inherit from Policy (Recommended)',
								value: 'inherit',
								description: 'Use server-side policy configuration',
							},
							{ name: 'Flag', value: 'flag' },
							{ name: 'Redact', value: 'redact' },
							{ name: 'Block', value: 'block' },
							{
								name: 'Score Only',
								value: 'score',
								description: 'Return risk score without enforcement',
							},
						],
						default: 'inherit',
						description: 'Override the default action when high risk content is detected',
					},
					{
						displayName: 'Write Clean Text To',
						name: 'cleanTextPath',
						type: 'string',
						default: 'cleanText',
						placeholder: 'cleanText, sanitized, clean.message',
						description: 'Field path where redacted/clean text will be written',
					},
					{
						displayName: 'Attach Metadata Under',
						name: 'metaPath',
						type: 'string',
						default: 'promptLock',
						placeholder: 'promptLock, security, analysis',
						description: 'Field path for analysis metadata (scores, violations, etc.)',
					},
					{
						displayName: 'Route "Score Only" To',
						name: 'routeScoreTo',
						type: 'options',
						options: [
							{ name: 'Flag Output', value: 'flag' },
							{ name: 'Allow Output', value: 'allow' },
						],
						default: 'flag',
						description: 'Which output to use when action is "score only"',
					},
					{
						displayName: 'On API Error',
						name: 'onError',
						type: 'options',
						options: [
							{
								name: 'Block (Fail Closed) - Recommended',
								value: 'block',
								description: 'Route to Block output when API fails - most secure',
							},
							{
								name: 'Flag',
								value: 'flag',
								description: 'Route to Flag output for manual review',
							},
							{
								name: 'Allow (Fail Open)',
								value: 'allow',
								description: 'Route to Allow output - least secure',
							},
							{
								name: 'Throw Error',
								value: 'throw',
								description: 'Stop workflow execution with error',
							},
						],
						default: 'block',
						description: 'Behavior when PromptLock API is unreachable or returns an error',
					},
					{
						displayName: 'Request Timeout (ms)',
						name: 'timeout',
						type: 'number',
						default: 15000,
						typeOptions: {
							minValue: 1000,
							maxValue: 60000,
							numberStepSize: 1000,
						},
						description: 'HTTP timeout for the analyze request (1-60 seconds)',
					},
				],
			},
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();

		// Initialize output arrays for the 4 outputs
		const outAllow: INodeExecutionData[] = [];
		const outFlag: INodeExecutionData[] = [];
		const outRedact: INodeExecutionData[] = [];
		const outBlock: INodeExecutionData[] = [];

		// Get credentials
		const credentials = await this.getCredentials('promptLockApiKey');
		const baseUrl = (credentials.baseUrl as string).replace(/\/+$/, '');
		const headerStyle = (credentials.headerStyle as string) || 'x-api-key';
		const apiKey = credentials.apiKey as string;

		// Process each input item
		for (let i = 0; i < items.length; i++) {
			const item = items[i];

			// Get node parameters for this item
			const textField = this.getNodeParameter('textField', i) as string;
			const frameworks = this.getNodeParameter('frameworks', i) as string[];
			const additionalSettings = this.getNodeParameter('additionalSettings', i, {}) as IDataObject;

			const actionOnHighRisk = (additionalSettings.actionOnHighRisk as string) || 'inherit';
			const cleanTextPath = (additionalSettings.cleanTextPath as string) || 'cleanText';
			const metaPath = (additionalSettings.metaPath as string) || 'promptLock';
			const routeScoreTo = (additionalSettings.routeScoreTo as string) || 'flag';
			const onError = (additionalSettings.onError as string) || 'block';
			const timeout = (additionalSettings.timeout as number) || 15000;

			const original = item.json as IDataObject;

			try {
				// Extract text from the specified field
				const text = getByPath(original, textField);
				if (typeof text !== 'string') {
					throw new NodeOperationError(
						this.getNode(),
						`Text field "${textField}" not found or not a string`,
						{ itemIndex: i },
					);
				}

				if (text.trim() === '') {
					throw new NodeOperationError(this.getNode(), `Text field "${textField}" is empty`, {
						itemIndex: i,
					});
				}

				// Prepare headers
				const headers: IDataObject = {
					'Content-Type': 'application/json',
					'User-Agent': 'n8n-promptlock-guard/1.0.0',
				};

				if (headerStyle === 'bearer') {
					headers.Authorization = `Bearer ${apiKey}`;
				} else {
					headers['X-API-Key'] = apiKey;
				}

				// Prepare request body
				const body: IDataObject = {
					text,
					compliance_frameworks: frameworks,
				};

				// Only send override if not "inherit"
				if (actionOnHighRisk !== 'inherit') {
					body.action_on_high_risk = actionOnHighRisk;
				}

				// Make API request
				const requestOptions: IHttpRequestOptions = {
					method: 'POST',
					url: `${baseUrl}/v1/analyze`,
					headers,
					body,
					json: true,
					timeout,
				};

				const response = (await this.helpers.httpRequest(requestOptions)) as IDataObject;

				// Prepare output item
				const outItem: IDataObject = { ...original };

				// Add clean text if provided
				if (response.clean_text !== undefined && response.clean_text !== null) {
					setByPath(outItem, cleanTextPath, response.clean_text);
				}

				// Add metadata
				const metadata = {
					risk_score: response.risk_score || 0,
					action_taken: response.action_taken || 'allow',
					violations: response.violations || [],
					compliance_status: response.compliance_status || {},
					usage: response.usage || {},
					medical_context_detected: response.medical_context_detected || false,
					timestamp: new Date().toISOString(),
					node_version: '1.0.0',
				};
				setByPath(outItem, metaPath, metadata);

				// Determine which output to route to
				const action = (response.action_taken as string) || 'allow';
				let targetOutput = action;

				if (action === 'score') {
					targetOutput = routeScoreTo === 'allow' ? 'allow' : 'flag';
				}

				// Route to appropriate output
				const outputItem = { json: outItem, pairedItem: { item: i } };
				switch (targetOutput) {
					case 'allow':
						outAllow.push(outputItem);
						break;
					case 'flag':
						outFlag.push(outputItem);
						break;
					case 'redact':
						outRedact.push(outputItem);
						break;
					case 'block':
						outBlock.push(outputItem);
						break;
					default:
						// Fallback to flag for unknown actions
						outFlag.push(outputItem);
						break;
				}
			} catch (error) {
				// Handle errors according to the error policy
				const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
				const errorType = error instanceof Error ? error.constructor.name : 'UnknownError';
				const errorMetadata = {
					error: errorMessage,
					error_type: errorType,
					node: 'PromptLockGuard',
					timestamp: new Date().toISOString(),
					node_version: '1.0.0',
				};

				const outItem: IDataObject = { ...original };
				setByPath(outItem, metaPath, errorMetadata);
				const outputItem = { json: outItem, pairedItem: { item: i } };

				if (onError === 'throw') {
					throw new NodeOperationError(this.getNode(), errorMessage, { itemIndex: i });
				} else if (onError === 'allow') {
					outAllow.push(outputItem);
				} else if (onError === 'flag') {
					outFlag.push(outputItem);
				} else {
					// Default to block (fail-closed)
					outBlock.push(outputItem);
				}
			}
		}

		// Return all four outputs: Allow, Flag, Redact, Block
		return [outAllow, outFlag, outRedact, outBlock];
	}
}

/**
 * Helper function to get value from object using dot notation path
 */
function getByPath(obj: IDataObject, path: string): unknown {
	if (!path || !obj) return undefined;

	return path.split('.').reduce((current: any, key: string) => {
		return current != null && typeof current === 'object' ? current[key] : undefined;
	}, obj);
}

/**
 * Helper function to set value in object using dot notation path
 */
function setByPath(obj: IDataObject, path: string, value: unknown): void {
	if (!path || !obj) return;

	const keys = path.split('.');
	let current: any = obj;

	// Navigate to the parent of the final key
	for (let i = 0; i < keys.length - 1; i++) {
		const key = keys[i];
		if (current[key] == null || typeof current[key] !== 'object' || Array.isArray(current[key])) {
			current[key] = {};
		}
		current = current[key];
	}

	// Set the final value
	current[keys[keys.length - 1]] = value;
}
