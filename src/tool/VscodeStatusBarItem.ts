import { StatusBarAlignment, StatusBarItem, window } from 'vscode';

class VscodeStatusBarItem {
  private statusBarItem: StatusBarItem;
  private timerId!: NodeJS.Timeout;

  constructor(
    command?: string,
    alignment?: StatusBarAlignment,
    priority?: number
  ) {
    this.statusBarItem = window.createStatusBarItem(alignment, priority);
    this.statusBarItem.command = command;
  }

  public show(): void {
    this.statusBarItem.show();
  }

  public hide(): void {
    this.statusBarItem.hide();
  }

  public destroy(): void {
    this.statusBarItem.dispose();
  }

  public notify(icon: string, text: string, autoHide: boolean = true) {
    this.show();
    if (this.timerId) {
      clearTimeout(this.timerId);
    }
    this.statusBarItem.text = `$(${icon}) ${text}`;

    if (autoHide) {
      this.timerId = setTimeout(() => {
        this.statusBarItem.text = `$(${icon}) i18n`;
        this.statusBarItem.tooltip = `${text}`;
      }, 5000);
    }
  }
}

export default VscodeStatusBarItem;
