export const TEMPLATE_NAMES =  new Map().set('SINGLE_PLAYBOOK', {displayName: 'Conversational App Single Playbook', name: 'conversational-app-single-playbook'})
                                        .set('MULTIPLE_PLAYBOOK', {displayName: 'Conversational App Multi Playbook', name: 'conversational-app-multi-playbook'})
                                        .set('AGENT_BUILDER_SEARCH', {displayName: 'Website Search using Agent Builder', name: 'website-search-using-agent-builder'})
                                        .set('AGENT_BUILDER_DOCUMENT_SEARCH', {displayName: 'Document Search using Agent Builder', name: 'document-search-using-agent-builder'});

export interface template {
    displayName: string;
    name: string
}
