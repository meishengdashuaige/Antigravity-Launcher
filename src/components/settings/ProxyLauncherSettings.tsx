import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { 
    Rocket, 
    Link2, 
    FileCode, 
    CheckCircle2, 
    XCircle, 
    Copy, 
    Download, 
    Activity
} from 'lucide-react';
import { showToast } from '../common/ToastContainer';
import ModalDialog from '../common/ModalDialog';
import { AppConfig, ProxyLauncherConfig, ProxyTestResult } from '../../types/config';
import { 
    testProxyConnection, 
    createProxyDesktopShortcut, 
    generateProxyLaunchScript, 
    launchAntigravity 
} from '../../services/antigravityService';

interface ProxyLauncherSettingsProps {
    formData: AppConfig;
    setFormData: React.Dispatch<React.SetStateAction<AppConfig>>;
}

export function ProxyLauncherSettings({ formData, setFormData }: ProxyLauncherSettingsProps) {
    const { t } = useTranslation();

    const proxyLauncher: ProxyLauncherConfig = formData.proxy_launcher || {
        enabled: true,
        proxy_url: 'http://127.0.0.1:7897',
        no_proxy: 'localhost,127.0.0.1,::1',
        mode: 'vbs_silent',
    };

    const updateProxyLauncher = (updates: Partial<ProxyLauncherConfig>) => {
        setFormData(prev => ({
            ...prev,
            proxy_launcher: {
                ...(prev.proxy_launcher || {
                    enabled: true,
                    proxy_url: 'http://127.0.0.1:7897',
                    no_proxy: 'localhost,127.0.0.1,::1',
                    mode: 'vbs_silent',
                }),
                ...updates,
            }
        }));
    };

    // Proxy testing state
    const [isTesting, setIsTesting] = useState(false);
    const [testResult, setTestResult] = useState<ProxyTestResult | null>(null);

    // Script export modal state
    const [isScriptModalOpen, setIsScriptModalOpen] = useState(false);
    const [selectedScriptType, setSelectedScriptType] = useState<'vbs' | 'cmd' | 'ps1' | 'sh'>('vbs');
    const [scriptContent, setScriptContent] = useState<string>('');
    const [isGeneratingScript, setIsGeneratingScript] = useState(false);

    // Launch testing state
    const [isLaunching, setIsLaunching] = useState(false);

    const presets = [
        { name: 'Clash (7897)', url: 'http://127.0.0.1:7897' },
        { name: 'Clash (7890)', url: 'http://127.0.0.1:7890' },
        { name: 'v2ray / Xray (10809)', url: 'http://127.0.0.1:10809' },
        { name: 'Sing-box (2080)', url: 'http://127.0.0.1:2080' },
        { name: 'SOCKS5 (10808)', url: 'socks5://127.0.0.1:10808' },
        { name: 'Shadowsocks (1080)', url: 'http://127.0.0.1:1080' },
    ];

    const handleTestConnection = async () => {
        if (!proxyLauncher.proxy_url) {
            showToast(t('settings.proxy_launcher.url_empty', '请输入代理地址'), 'warning');
            return;
        }

        setIsTesting(true);
        setTestResult(null);
        try {
            const result = await testProxyConnection(proxyLauncher.proxy_url);
            setTestResult(result);
            if (result.success) {
                showToast(t('settings.proxy_launcher.test_success', '代理连通性测试成功！'), 'success');
            } else {
                showToast(result.message || t('settings.proxy_launcher.test_failed', '无法连接到代理端口'), 'error');
            }
        } catch (error) {
            console.error('Test connection error:', error);
            showToast(`${t('settings.proxy_launcher.test_error', '测试失败')}: ${error}`, 'error');
        } finally {
            setIsTesting(false);
        }
    };

    const handleCreateShortcut = async () => {
        try {
            const path = await createProxyDesktopShortcut({
                proxyUrl: proxyLauncher.proxy_url,
                noProxy: proxyLauncher.no_proxy,
            });
            showToast(t('settings.proxy_launcher.shortcut_success', { path }) || `已成功在桌面创建免 TUN 快捷方式！`, 'success');
        } catch (error) {
            console.error('Create shortcut failed:', error);
            showToast(`${t('settings.proxy_launcher.shortcut_error', '创建快捷方式失败')}: ${error}`, 'error');
        }
    };

    const handleOpenScriptModal = async (type: 'vbs' | 'cmd' | 'ps1' | 'sh' = 'vbs') => {
        setSelectedScriptType(type);
        setIsGeneratingScript(true);
        setIsScriptModalOpen(true);
        try {
            const content = await generateProxyLaunchScript({
                proxyUrl: proxyLauncher.proxy_url,
                noProxy: proxyLauncher.no_proxy,
                scriptType: type,
            });
            setScriptContent(content);
        } catch (error) {
            console.error('Generate script error:', error);
            setScriptContent(`:: 生成脚本失败: ${error}`);
        } finally {
            setIsGeneratingScript(false);
        }
    };

    const handleScriptTypeChange = async (type: 'vbs' | 'cmd' | 'ps1' | 'sh') => {
        setSelectedScriptType(type);
        setIsGeneratingScript(true);
        try {
            const content = await generateProxyLaunchScript({
                proxyUrl: proxyLauncher.proxy_url,
                noProxy: proxyLauncher.no_proxy,
                scriptType: type,
            });
            setScriptContent(content);
        } catch (error) {
            console.error('Generate script error:', error);
            setScriptContent(`:: 生成脚本失败: ${error}`);
        } finally {
            setIsGeneratingScript(false);
        }
    };

    const handleCopyScript = () => {
        navigator.clipboard.writeText(scriptContent);
        showToast(t('common.copied', '已复制到剪贴板'), 'success');
    };

    const handleDownloadScript = () => {
        const extensions: Record<string, string> = {
            vbs: 'start-antigravity-proxy.vbs',
            cmd: 'start-antigravity-proxy.cmd',
            ps1: 'start-antigravity-proxy.ps1',
            sh: 'start-antigravity-proxy.sh',
        };
        const filename = extensions[selectedScriptType] || 'start-antigravity-proxy.txt';
        const blob = new Blob([scriptContent], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        showToast(t('settings.proxy_launcher.download_success', '脚本下载成功'), 'success');
    };

    const handleLaunchTest = async () => {
        setIsLaunching(true);
        try {
            await launchAntigravity({
                useProxy: true,
                proxyUrl: proxyLauncher.proxy_url,
                noProxy: proxyLauncher.no_proxy,
            });
            showToast(t('settings.proxy_launcher.launch_success', '已通过代理启动 Antigravity！'), 'success');
        } catch (error) {
            console.error('Launch test failed:', error);
            showToast(`${t('settings.proxy_launcher.launch_error', '启动失败')}: ${error}`, 'error');
        } finally {
            setIsLaunching(false);
        }
    };

    return (
        <div className="space-y-5">
            {/* Card Container */}
            <div className="bg-white dark:bg-base-100 rounded-xl p-5 border border-gray-100 dark:border-base-200 shadow-xs">
                {/* Section Header */}
                <div className="flex items-start justify-between pb-4 border-b border-gray-100 dark:border-base-200 mb-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30 rounded-xl text-blue-600 dark:text-blue-400">
                            <Rocket className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="text-base font-semibold text-gray-900 dark:text-base-content flex items-center gap-2">
                                {t('settings.proxy_launcher.title', '免 TUN 代理启动 (Proxy Launcher)')}
                                <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-blue-100 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400">
                                    RECOMMENDED
                                </span>
                            </h3>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                {t('settings.proxy_launcher.desc', '为 Antigravity 及其独立的 language_server 语言服务注入代理环境变量，免开启 Clash TUN 模式。')}
                            </p>
                        </div>
                    </div>

                    {/* Enable Toggle Switch */}
                    <div className="flex items-center gap-2">
                        <span className="text-xs font-medium text-gray-600 dark:text-gray-300">
                            {proxyLauncher.enabled ? t('common.enabled', '已启用') : t('common.disabled', '已禁用')}
                        </span>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                className="sr-only peer"
                                checked={proxyLauncher.enabled}
                                onChange={(e) => updateProxyLauncher({ enabled: e.target.checked })}
                            />
                            <div className="w-11 h-6 bg-gray-200 dark:bg-base-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                    </div>
                </div>

                {/* Settings Fields */}
                <div className="space-y-4">
                    {/* Proxy URL Input & Preset Buttons */}
                    <div>
                        <div className="flex justify-between items-center mb-1.5">
                            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">
                                {t('settings.proxy_launcher.proxy_url', '本地代理地址 (HTTP/HTTPS/SOCKS5)')}
                            </label>
                            <span className="text-[11px] text-gray-400 dark:text-gray-500">
                                {t('settings.proxy_launcher.proxy_url_hint', '支持 http:// 和 socks5:// 协议')}
                            </span>
                        </div>

                        <div className="flex gap-2">
                            <input
                                type="text"
                                className="flex-1 px-3.5 py-2.5 text-sm border border-gray-200 dark:border-base-300 rounded-lg bg-gray-50 dark:bg-base-200 text-gray-900 dark:text-base-content font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                value={proxyLauncher.proxy_url}
                                placeholder="http://127.0.0.1:7897"
                                onChange={(e) => updateProxyLauncher({ proxy_url: e.target.value })}
                            />
                            <button
                                onClick={handleTestConnection}
                                disabled={isTesting}
                                className="px-4 py-2.5 bg-gray-100 dark:bg-base-200 hover:bg-gray-200 dark:hover:bg-base-300 text-gray-700 dark:text-gray-300 text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5 border border-gray-200 dark:border-base-300 disabled:opacity-50 shrink-0"
                            >
                                <Activity className={`w-3.5 h-3.5 ${isTesting ? 'animate-spin text-blue-500' : 'text-gray-500'}`} />
                                <span>{isTesting ? t('settings.proxy_launcher.testing', '测试中...') : t('settings.proxy_launcher.test_btn', '测试连通性')}</span>
                            </button>
                        </div>

                        {/* Quick Preset Badges */}
                        <div className="flex flex-wrap items-center gap-1.5 mt-2">
                            <span className="text-[11px] text-gray-400 dark:text-gray-500 mr-1">
                                {t('settings.proxy_launcher.quick_presets', '快捷端口')}:
                            </span>
                            {presets.map(p => (
                                <button
                                    key={p.name}
                                    type="button"
                                    onClick={() => updateProxyLauncher({ proxy_url: p.url })}
                                    className={`px-2 py-0.5 text-[11px] font-mono rounded-md border transition-all ${
                                        proxyLauncher.proxy_url === p.url
                                            ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800 font-semibold shadow-xs'
                                            : 'bg-white dark:bg-base-200 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-base-300 hover:bg-gray-50 dark:hover:bg-base-300'
                                    }`}
                                >
                                    {p.name}
                                </button>
                            ))}
                        </div>

                        {/* Test Result Feedback Box */}
                        {testResult && (
                            <div className={`mt-2.5 p-2.5 rounded-lg border text-xs flex items-center gap-2 ${
                                testResult.success 
                                    ? 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/30'
                                    : 'bg-rose-50 dark:bg-rose-950/20 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800/30'
                            }`}>
                                {testResult.success ? (
                                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                                ) : (
                                    <XCircle className="w-4 h-4 text-rose-500 shrink-0" />
                                )}
                                <span className="flex-1">{testResult.message}</span>
                            </div>
                        )}
                    </div>

                    {/* Bypass List (NO_PROXY) */}
                    <div>
                        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                            {t('settings.proxy_launcher.no_proxy', '不走代理地址名单 (NO_PROXY)')}
                        </label>
                        <input
                            type="text"
                            className="w-full px-3.5 py-2.5 text-sm border border-gray-200 dark:border-base-300 rounded-lg bg-gray-50 dark:bg-base-200 text-gray-900 dark:text-base-content font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            value={proxyLauncher.no_proxy}
                            placeholder="localhost,127.0.0.1,::1"
                            onChange={(e) => updateProxyLauncher({ no_proxy: e.target.value })}
                        />
                        <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-1">
                            {t('settings.proxy_launcher.no_proxy_desc', '多个地址使用英文逗号分隔，默认推荐保留 localhost,127.0.0.1,::1。')}
                        </p>
                    </div>

                    {/* Action Tools & Helper Buttons */}
                    <div className="pt-3 border-t border-gray-100 dark:border-base-200 flex flex-wrap items-center gap-2.5">
                        {/* Create Shortcut Button */}
                        <button
                            onClick={handleCreateShortcut}
                            className="px-3.5 py-2 rounded-lg bg-blue-50 dark:bg-blue-950/20 hover:bg-blue-100 dark:hover:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-xs font-medium transition-colors flex items-center gap-1.5 border border-blue-200 dark:border-blue-800/30"
                        >
                            <Link2 className="w-3.5 h-3.5" />
                            <span>{t('settings.proxy_launcher.btn_create_shortcut', '一键创建桌面快捷方式 (带原生图标)')}</span>
                        </button>

                        {/* Export Script Button */}
                        <button
                            onClick={() => handleOpenScriptModal('vbs')}
                            className="px-3.5 py-2 rounded-lg bg-gray-100 dark:bg-base-200 hover:bg-gray-200 dark:hover:bg-base-300 text-gray-700 dark:text-gray-300 text-xs font-medium transition-colors flex items-center gap-1.5 border border-gray-200 dark:border-base-300"
                        >
                            <FileCode className="w-3.5 h-3.5 text-gray-500" />
                            <span>{t('settings.proxy_launcher.btn_export_script', '导出启动脚本 (.vbs / .bat / .sh)')}</span>
                        </button>

                        {/* Test Launch Button */}
                        <button
                            onClick={handleLaunchTest}
                            disabled={isLaunching}
                            className="px-3.5 py-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/20 hover:bg-emerald-100 dark:hover:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 text-xs font-medium transition-colors flex items-center gap-1.5 border border-emerald-200 dark:border-emerald-800/30 ml-auto disabled:opacity-50"
                        >
                            <Rocket className={`w-3.5 h-3.5 ${isLaunching ? 'animate-bounce' : ''}`} />
                            <span>{t('settings.proxy_launcher.btn_test_launch', '立即通过代理启动测试')}</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Script Export Modal */}
            <ModalDialog
                isOpen={isScriptModalOpen}
                onConfirm={() => setIsScriptModalOpen(false)}
                onCancel={() => setIsScriptModalOpen(false)}
                confirmText={t('common.close', '关闭')}
                title={t('settings.proxy_launcher.modal_script_title', '免 TUN 代理启动脚本')}
            >
                <div className="space-y-4">
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                        {t('settings.proxy_launcher.modal_script_desc', '选择适合您操作系统和使用习惯的脚本格式，您可以复制脚本内容或直接保存到本地。')}
                    </p>

                    {/* Script Format Tabs */}
                    <div className="flex bg-gray-100 dark:bg-base-200 p-1 rounded-lg gap-1">
                        <button
                            className={`flex-1 py-1.5 px-3 rounded-md text-xs font-medium transition-all ${
                                selectedScriptType === 'vbs'
                                    ? 'bg-white dark:bg-base-100 text-blue-600 dark:text-blue-400 shadow-xs'
                                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900'
                            }`}
                            onClick={() => handleScriptTypeChange('vbs')}
                        >
                            Windows VBS (静默无黑窗)
                        </button>
                        <button
                            className={`flex-1 py-1.5 px-3 rounded-md text-xs font-medium transition-all ${
                                selectedScriptType === 'cmd'
                                    ? 'bg-white dark:bg-base-100 text-blue-600 dark:text-blue-400 shadow-xs'
                                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900'
                            }`}
                            onClick={() => handleScriptTypeChange('cmd')}
                        >
                            Windows Batch (.cmd / .bat)
                        </button>
                        <button
                            className={`flex-1 py-1.5 px-3 rounded-md text-xs font-medium transition-all ${
                                selectedScriptType === 'ps1'
                                    ? 'bg-white dark:bg-base-100 text-blue-600 dark:text-blue-400 shadow-xs'
                                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900'
                            }`}
                            onClick={() => handleScriptTypeChange('ps1')}
                        >
                            PowerShell (.ps1)
                        </button>
                        <button
                            className={`flex-1 py-1.5 px-3 rounded-md text-xs font-medium transition-all ${
                                selectedScriptType === 'sh'
                                    ? 'bg-white dark:bg-base-100 text-blue-600 dark:text-blue-400 shadow-xs'
                                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900'
                            }`}
                            onClick={() => handleScriptTypeChange('sh')}
                        >
                            macOS / Linux (.sh)
                        </button>
                    </div>

                    {/* Script Content Viewer */}
                    <div className="relative">
                        <pre className="p-3.5 rounded-lg bg-gray-900 text-gray-100 font-mono text-xs overflow-x-auto max-h-64 border border-gray-800 leading-relaxed">
                            {isGeneratingScript ? 'Generating script...' : scriptContent}
                        </pre>
                    </div>

                    {/* Modal Footer Actions */}
                    <div className="flex justify-end gap-2 pt-2">
                        <button
                            onClick={handleCopyScript}
                            className="px-3.5 py-2 rounded-lg bg-gray-100 dark:bg-base-200 hover:bg-gray-200 dark:hover:bg-base-300 text-gray-700 dark:text-gray-300 text-xs font-medium transition-colors flex items-center gap-1.5 border border-gray-200 dark:border-base-300"
                        >
                            <Copy className="w-3.5 h-3.5" />
                            <span>{t('common.copy', '复制代码')}</span>
                        </button>
                        <button
                            onClick={handleDownloadScript}
                            className="px-3.5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium transition-colors flex items-center gap-1.5 shadow-sm"
                        >
                            <Download className="w-3.5 h-3.5" />
                            <span>{t('common.download', '保存文件')}</span>
                        </button>
                    </div>
                </div>
            </ModalDialog>
        </div>
    );
}

export default ProxyLauncherSettings;
