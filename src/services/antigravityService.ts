import { request as invoke } from '../utils/request';
import { AntigravityProcessStatus, ProxyTestResult } from '../types/config';

export interface LaunchAntigravityOptions {
    targetIde?: string;
    useProxy?: boolean;
    proxyUrl?: string;
    noProxy?: string;
}

export interface RestartAntigravityOptions {
    targetIde?: string;
    useProxy?: boolean;
}

export interface CreateShortcutOptions {
    targetIde?: string;
    proxyUrl?: string;
    noProxy?: string;
    shortcutName?: string;
}

export interface GenerateScriptOptions {
    targetIde?: string;
    proxyUrl?: string;
    noProxy?: string;
    scriptType: string;
}

/**
 * 启动 Antigravity（支持自定义代理设置）
 */
export async function launchAntigravity(options: LaunchAntigravityOptions = {}): Promise<void> {
    return await invoke('launch_antigravity', {
        targetIde: options.targetIde,
        useProxy: options.useProxy,
        proxyUrl: options.proxyUrl,
        noProxy: options.noProxy,
    });
}

/**
 * 重启 Antigravity
 */
export async function restartAntigravity(options: RestartAntigravityOptions = {}): Promise<void> {
    return await invoke('restart_antigravity', {
        targetIde: options.targetIde,
        useProxy: options.useProxy,
    });
}

/**
 * 关闭 Antigravity 进程
 */
export async function closeAntigravity(targetIde?: string): Promise<void> {
    return await invoke('close_antigravity', { targetIde });
}

/**
 * 获取 Antigravity 进程及代理状态
 */
export async function getAntigravityProcessStatus(targetIde?: string): Promise<AntigravityProcessStatus> {
    return await invoke<AntigravityProcessStatus>('get_antigravity_process_status', { targetIde });
}

/**
 * 一键在桌面创建免 TUN 代理快捷方式
 */
export async function createProxyDesktopShortcut(options: CreateShortcutOptions = {}): Promise<string> {
    return await invoke<string>('create_proxy_desktop_shortcut', {
        targetIde: options.targetIde,
        proxyUrl: options.proxyUrl,
        noProxy: options.noProxy,
        shortcutName: options.shortcutName,
    });
}

/**
 * 生成或导出免 TUN 代理启动脚本
 */
export async function generateProxyLaunchScript(options: GenerateScriptOptions): Promise<string> {
    return await invoke<string>('generate_proxy_launch_script', {
        targetIde: options.targetIde,
        proxyUrl: options.proxyUrl,
        noProxy: options.noProxy,
        scriptType: options.scriptType,
    });
}

/**
 * 测试本地/远程代理连通性
 */
export async function testProxyConnection(proxyUrl: string): Promise<ProxyTestResult> {
    return await invoke<ProxyTestResult>('test_proxy_connection', { proxyUrl });
}
