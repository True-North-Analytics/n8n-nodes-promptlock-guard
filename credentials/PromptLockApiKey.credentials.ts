import {
	IAuthenticateGeneric,
	ICredentialTestRequest,
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';
export class PromptLockApiKey implements ICredentialType {
	name = 'promptLockApiKey';
	displayName = 'PromptLock API Key';
	documentationUrl = 'https://docs.promptlock.com/integrations/n8n';
	properties: INodeProperties[] = [
		{
			displayName: 'Base URL',
			name: 'baseUrl',
			type: 'string',
			default: 'https://api.promptlock.io',
			placeholder: 'https://api.promptlock.io',
			description: 'Root URL of the PromptLock API (no trailing slash)',
			required: true,
		},
		{
			displayName: 'API Key',
			name: 'apiKey',
			type: 'string',
			typeOptions: { password: true },
			default: '',
			placeholder: 'ps_...',
			description: 'Your PromptLock API key (starts with ps_)',
			required: true,
		},
		{
			displayName: 'Header Style',
			name: 'headerStyle',
			type: 'options',
			options: [
				{
					name: 'X-API-Key (Recommended)',
					value: 'x-api-key',
					description: 'Send API key in X-API-Key header',
				},
				{
					name: 'Authorization Bearer',
					value: 'bearer',
					description: 'Send API key in Authorization: Bearer header',
				},
			],
			default: 'x-api-key',
			description: 'How to send the API key (both are supported by PromptLock)',
		},
	];
	authenticate: IAuthenticateGeneric = {
		type: 'generic',
		properties: {
			headers: {
				'X-API-Key': '={{$credentials.apiKey}}',
			},
		},
	};
	test: ICredentialTestRequest = {
		request: {
			baseURL: '={{$credentials.baseUrl}}',
			url: '/v1/analyze',
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: {
				text: 'Test connection',
				compliance_frameworks: ['HIPAA'],
			},
		},
		rules: [
			{
				type: 'responseSuccessBody',
				properties: {
					key: 'risk_score',
					value: undefined,
					message: 'Invalid API credentials or server error',
				},
			},
		],
	};
}
