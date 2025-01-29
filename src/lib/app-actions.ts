import { exit, relaunch } from '@tauri-apps/plugin-process';

export const quitApp = async () => await exit(0);
export const relaunchApp = async () => await relaunch();
