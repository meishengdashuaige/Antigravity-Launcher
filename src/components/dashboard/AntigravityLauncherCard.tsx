import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { 
    Rocket, 
    RefreshCw, 
    Power, 
    ShieldCheck, 
    Zap, 
    Link2, 
    Settings
} from 'lucide-react';
import { showToast } from '../common/ToastContainer';
import { useConfigStore } from '../../stores/useConfigStore';
import { 
    getAntigravityProcessStatus, 
    launchAntigravity, 
    restartAntigravity, 
    closeAntigravity, 
    createProxyDesktopShortcut 
} from '../../services/antigravityService';
import { AntigravityProcessStatus } from '../../types/config';

export function AntigravityLauncherCard() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { config } = useConfigStore();

    const [status, setStatus] = useState<AntigravityProcessStatus | null>(null);
    const [loading, setLoading] = useState(false);
    const [targetIde, setTargetIde] = useState<'client' | 'ide' | 'cli'>('client');

    const proxyConfig = config?.proxy_launcher;
    const proxyUrl = proxyConfig?.proxy_url || 'http://127.0.0.1:7897';
    const isProxyEnabled = proxyConfig?.enabled ?? true;

    const fetchStatus = async () => {
        try {
            const ideParam = targetIde === 'client' ? undefined : targetIde;
            const res = await getAntigravityProcessStatus(ideParam);
            setStatus(res);
        } catch (err) {
            console.error('Failed to get process status:', err);
        }
    };

    useEffect(() => {
        fetchStatus();
        const interval = setInterval(fetchStatus, 5000);
        return () => clearInterval(interval);
    }, [targetIde]);

    const handleLaunchWithProxy = async () => {
        setLoading(true);
        try {
            const ideParam = targetIde === 'client' ? undefined : targetIde;
            await launchAntigravity({
                targetIde: ideParam,
                useProxy: true,
                proxyUrl: proxyUrl,
                noProxy: proxyConfig?.no_proxy || 'localhost,127.0.0.1,::1',
            });
            const targetName = targetIde === 'ide' ? 'Antigravity IDE' : targetIde === 'cli' ? 'Antigravity CLI' : 'Antigravity';
            showToast(t('launcher.toast_launch_proxy_success', { name: targetName }) || `已通过代理启动 ${targetName}`, 'success');
            setTimeout(fetchStatus, 1500);
        } catch (error) {
            console.error('Launch with proxy failed:', error);
            showToast(`${t('launcher.toast_launch_error', '启动失败')}: ${error}`, 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleLaunchDirect = async () => {
        setLoading(true);
        try {
            const ideParam = targetIde === 'client' ? undefined : targetIde;
            await launchAntigravity({
                targetIde: ideParam,
                useProxy: false,
            });
            const targetName = targetIde === 'ide' ? 'Antigravity IDE' : targetIde === 'cli' ? 'Antigravity CLI' : 'Antigravity';
            showToast(t('launcher.toast_launch_direct_success', { name: targetName }) || `已直连启动 ${targetName}`, 'success');
            setTimeout(fetchStatus, 1500);
        } catch (error) {
            console.error('Direct launch failed:', error);
            showToast(`${t('launcher.toast_launch_error', '启动失败')}: ${error}`, 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleRestart = async () => {
        setLoading(true);
        try {
            const ideParam = targetIde === 'client' ? undefined : targetIde;
            await restartAntigravity({
                targetIde: ideParam,
                useProxy: isProxyEnabled,
            });
            const targetName = targetIde === 'ide' ? 'Antigravity IDE' : targetIde === 'cli' ? 'Antigravity CLI' : 'Antigravity';
            showToast(t('launcher.toast_restart_success', { name: targetName }) || `${targetName} 重启成功`, 'success');
            setTimeout(fetchStatus, 2000);
        } catch (error) {
            console.error('Restart failed:', error);
            showToast(`${t('launcher.toast_restart_error', '重启失败')}: ${error}`, 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleClose = async () => {
        setLoading(true);
        try {
            const ideParam = targetIde === 'client' ? undefined : targetIde;
            await closeAntigravity(ideParam);
            const targetName = targetIde === 'ide' ? 'Antigravity IDE' : targetIde === 'cli' ? 'Antigravity CLI' : 'Antigravity';
            showToast(t('launcher.toast_close_success', { name: targetName }) || `已关闭 ${targetName} 进程`, 'success');
            setTimeout(fetchStatus, 1500);
        } catch (error) {
            console.error('Close failed:', error);
            showToast(`${t('launcher.toast_close_error', '关闭失败')}: ${error}`, 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleCreateShortcut = async () => {
        try {
            const ideParam = targetIde === 'client' ? undefined : targetIde;
            const shortcutPath = await createProxyDesktopShortcut({
                targetIde: ideParam,
                proxyUrl: proxyUrl,
                noProxy: proxyConfig?.no_proxy || 'localhost,127.0.0.1,::1',
            });
            showToast(t('launcher.toast_shortcut_success', { path: shortcutPath }) || `已在桌面创建快捷方式`, 'success');
        } catch (error) {
            console.error('Create shortcut failed:', error);
            showToast(`${t('launcher.toast_shortcut_error', '创建快捷方式失败')}: ${error}`, 'error');
        }
    };

    const isRunning = status?.is_running ?? false;

    return (
        <div className="bg-white dark:bg-base-100 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-base-200 flex flex-col justify-between space-y-3">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-blue-50 dark:bg-blue-900/20 rounded-md text-blue-500 dark:text-blue-400">
                        <Rocket className="w-4 h-4" />
                    </div>
                    <h2 className="text-base font-semibold text-gray-900 dark:text-base-content">
                        {t('launcher.title', 'Antigravity 启动与代理控制')}
                    </h2>
                </div>

                {/* Target Switcher & Status Badge */}
                <div className="flex items-center gap-2">
                    {/* Target Switch: Client | IDE | CLI */}
                    <div className="flex bg-gray-100 dark:bg-base-200 p-0.5 rounded-lg text-xs font-medium border border-gray-200 dark:border-base-300">
                        <button
                            className={`px-2.5 py-1 rounded-md transition-all ${
                                targetIde === 'client' 
                                    ? 'bg-white dark:bg-base-100 text-blue-600 dark:text-blue-400 shadow-xs font-semibold' 
                                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
                            }`}
                            onClick={() => setTargetIde('client')}
                        >
                            Client
                        </button>
                        <button
                            className={`px-2.5 py-1 rounded-md transition-all ${
                                targetIde === 'ide' 
                                    ? 'bg-white dark:bg-base-100 text-blue-600 dark:text-blue-400 shadow-xs font-semibold' 
                                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
                            }`}
                            onClick={() => setTargetIde('ide')}
                        >
                            IDE
                        </button>
                        <button
                            className={`px-2.5 py-1 rounded-md transition-all ${
                                targetIde === 'cli' 
                                    ? 'bg-white dark:bg-base-100 text-blue-600 dark:text-blue-400 shadow-xs font-semibold' 
                                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
                            }`}
                            onClick={() => setTargetIde('cli')}
                        >
                            CLI
                        </button>
                    </div>

                    {/* Running Status Badge */}
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${
                        isRunning 
                            ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/40'
                            : 'bg-gray-100 dark:bg-base-200 text-gray-500 dark:text-gray-400 border-gray-200 dark:border-base-300'
                    }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${isRunning ? 'bg-emerald-500 animate-pulse' : 'bg-gray-400'}`} />
                        {isRunning 
                            ? (status?.pids?.length ? `${t('launcher.status_running', '运行中')} (${status.pids.length})` : t('launcher.status_running', '运行中'))
                            : t('launcher.status_stopped', '未运行')
                        }
                    </span>
                </div>
            </div>

            {/* Proxy Information Row */}
            <div className="flex items-center justify-between text-xs py-1 border-t border-b border-gray-100 dark:border-base-200 text-gray-600 dark:text-gray-400">
                <div className="flex items-center gap-2 min-w-0">
                    <ShieldCheck className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                    <span className="font-medium text-gray-700 dark:text-gray-300 truncate">
                        {t('launcher.current_proxy', '代理地址')}:
                    </span>
                    <code className="px-2 py-0.5 rounded bg-gray-100 dark:bg-base-200 text-blue-600 dark:text-blue-400 font-mono text-xs border border-gray-200 dark:border-base-300 truncate">
                        {proxyUrl}
                    </code>
                </div>

                <button 
                    onClick={() => navigate('/settings?tab=advanced', { state: { tab: 'advanced' } })}
                    className="p-1 rounded-md text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-base-200 transition-colors shrink-0"
                    title={t('settings.tabs.advanced', '高级设置')}
                >
                    <Settings className="w-4 h-4" />
                </button>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-2 pt-0.5">
                {/* Main Launch Button */}
                <button
                    onClick={handleLaunchWithProxy}
                    disabled={loading}
                    className="flex-1 min-w-[140px] px-3.5 py-2 rounded-lg bg-blue-500 hover:bg-blue-600 text-white font-medium text-xs shadow-sm hover:shadow active:scale-[0.98] transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
                >
                    <Rocket className={`w-3.5 h-3.5 ${loading ? 'animate-bounce' : ''}`} />
                    <span>{t('launcher.btn_launch_proxy', '通过代理启动')}</span>
                </button>

                {/* Restart Button */}
                <button
                    onClick={handleRestart}
                    disabled={loading}
                    className="px-3 py-2 rounded-lg bg-gray-100 dark:bg-base-200 hover:bg-gray-200 dark:hover:bg-base-300 text-gray-700 dark:text-gray-300 font-medium text-xs transition-colors flex items-center gap-1.5 border border-gray-200 dark:border-base-300 disabled:opacity-50"
                    title={t('launcher.btn_restart_desc', '重启进程')}
                >
                    <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                    <span>{t('launcher.btn_restart', '重启')}</span>
                </button>

                {/* Direct Launch Button */}
                <button
                    onClick={handleLaunchDirect}
                    disabled={loading}
                    className="px-3 py-2 rounded-lg bg-gray-100 dark:bg-base-200 hover:bg-gray-200 dark:hover:bg-base-300 text-gray-700 dark:text-gray-300 font-medium text-xs transition-colors flex items-center gap-1.5 border border-gray-200 dark:border-base-300 disabled:opacity-50"
                    title={t('launcher.btn_direct_desc', '不使用代理直连启动')}
                >
                    <Zap className="w-3.5 h-3.5 text-amber-500" />
                    <span>{t('launcher.btn_direct', '直连启动')}</span>
                </button>

                {/* Close Button (if running) */}
                {isRunning && (
                    <button
                        onClick={handleClose}
                        disabled={loading}
                        className="px-3 py-2 rounded-lg bg-red-50 dark:bg-red-950/20 hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 font-medium text-xs transition-colors flex items-center gap-1.5 border border-red-200 dark:border-red-800/30 disabled:opacity-50"
                        title={t('launcher.btn_close_desc', '结束相关进程')}
                    >
                        <Power className="w-3.5 h-3.5" />
                        <span>{t('launcher.btn_close', '关闭')}</span>
                    </button>
                )}

                {/* Desktop Shortcut Button */}
                <button
                    onClick={handleCreateShortcut}
                    className="px-3 py-2 rounded-lg bg-gray-100 dark:bg-base-200 hover:bg-gray-200 dark:hover:bg-base-300 text-gray-700 dark:text-gray-300 font-medium text-xs transition-colors flex items-center gap-1.5 border border-gray-200 dark:border-base-300 shrink-0"
                    title={t('launcher.btn_shortcut_desc', '在桌面创建快捷方式')}
                >
                    <Link2 className="w-3.5 h-3.5 text-blue-500" />
                    <span>{t('launcher.btn_shortcut', '桌面快捷方式')}</span>
                </button>
            </div>
        </div>
    );
}

export default AntigravityLauncherCard;
