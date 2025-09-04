interface ExportMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp?: Date;
}

export function exportAsMarkdown(messages: ExportMessage[], title?: string): string {
  let markdown = `# ${title || 'Chat Conversation'}\n\n`;
  markdown += `_Exported on ${new Date().toLocaleString()}_\n\n---\n\n`;

  messages.forEach((msg, index) => {
    const roleLabel = msg.role === 'user' ? '👤 User' : '🤖 Assistant';
    const timestamp = msg.timestamp ? ` (${msg.timestamp.toLocaleTimeString()})` : '';
    
    markdown += `## ${roleLabel}${timestamp}\n\n`;
    markdown += `${msg.content}\n\n`;
    
    if (index < messages.length - 1) {
      markdown += `---\n\n`;
    }
  });

  return markdown;
}

export function exportAsJSON(messages: ExportMessage[], title?: string): string {
  return JSON.stringify({
    title: title || 'Chat Conversation',
    exportedAt: new Date().toISOString(),
    messages: messages.map(msg => ({
      role: msg.role,
      content: msg.content,
      timestamp: msg.timestamp?.toISOString()
    }))
  }, null, 2);
}

export function exportAsText(messages: ExportMessage[], title?: string): string {
  let text = `${title || 'Chat Conversation'}\n`;
  text += `Exported on ${new Date().toLocaleString()}\n`;
  text += '='.repeat(50) + '\n\n';

  messages.forEach(msg => {
    const roleLabel = msg.role === 'user' ? 'USER' : 'ASSISTANT';
    const timestamp = msg.timestamp ? ` [${msg.timestamp.toLocaleTimeString()}]` : '';
    
    text += `${roleLabel}${timestamp}:\n`;
    text += msg.content + '\n\n';
    text += '-'.repeat(30) + '\n\n';
  });

  return text;
}

export function downloadFile(content: string, filename: string, type: string = 'text/plain') {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function copyToClipboard(text: string): Promise<boolean> {
  return navigator.clipboard.writeText(text)
    .then(() => true)
    .catch(() => false);
}

export class ConversationExporter {
  private messages: ExportMessage[];
  private title: string;

  constructor(messages: ExportMessage[], title?: string) {
    this.messages = messages;
    this.title = title || `Chat_${new Date().toISOString().split('T')[0]}`;
  }

  exportAsMarkdown() {
    const content = exportAsMarkdown(this.messages, this.title);
    downloadFile(content, `${this.title}.md`, 'text/markdown');
  }

  exportAsJSON() {
    const content = exportAsJSON(this.messages, this.title);
    downloadFile(content, `${this.title}.json`, 'application/json');
  }

  exportAsText() {
    const content = exportAsText(this.messages, this.title);
    downloadFile(content, `${this.title}.txt`, 'text/plain');
  }

  async copyAsMarkdown(): Promise<boolean> {
    const content = exportAsMarkdown(this.messages, this.title);
    return copyToClipboard(content);
  }
}