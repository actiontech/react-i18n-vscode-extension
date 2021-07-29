import VscodeEvent from '../event/VscodeEvent';

export const getRealPath = (path: string) => {
  const workspaceUrl = VscodeEvent.getWorkspacePath();
  if (!path.startsWith('/')) {
    return `${workspaceUrl}/${path}`;
  }
  return path;
};
