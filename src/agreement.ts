import ShareMyPlugin from "main";
import { Notice, ObsidianProtocolData, debounce } from "obsidian";

// 导出一个全局的 communityPlugins 变量，可在其他模块中使用
export let communityPlugins: any;

/**
 * 插件安装器类，负责处理插件的安装和解析安装参数等操作
 */


export default class Agreement {
    // 引用 ShareMyPlugin 实例，方便访问主插件的属性和方法
    plugin: ShareMyPlugin;
    // 存储社区插件信息的对象，键为插件 ID，值为插件详细信息
    communityPlugins: Record<string, { [key: string]: string }>;
    // 标记是否已经加载了社区插件列表
    loaded: boolean = false;
    // 防抖函数，用于定时刷新社区插件列表，每小时执行一次
    debounceFetch = debounce(async () => { await this.fetchCommunityPlugins() }, 1000 * 60 * 60);

    /**
     * 从远程获取社区插件列表，并将其转换为以插件 ID 为键的对象
     */
    async fetchCommunityPlugins() {
        // 从指定的 URL 获取社区插件列表的 JSON 数据
        const pluginList = await fetch(`https://raw.githubusercontent.com/obsidianmd/obsidian-releases/master/community-plugins.json`).then(r => r.json());
        if (!pluginList.ok) { new Notice(`[插件管理器] 无法连接到Github(跳转主页及下载不可用)`); }
        // 创建一个空对象，用于存储以插件 ID 为键的插件信息
        const keyedPluginList: Record<string, any> = {};
        // 遍历插件列表，将每个插件的信息存储到 keyedPluginList 中
        for (const item of pluginList) keyedPluginList[item.id] = item;
        // 将处理后的插件列表赋值给 communityPlugins 属性
        this.communityPlugins = keyedPluginList;
        // 标记社区插件列表已加载
        this.loaded = true;
    }

    /**
     * 构造函数，初始化插件安装器
     * @param SMPL - ShareMyPlugin 实例
     */
    constructor(SMPL: ShareMyPlugin) {
        // 保存 ShareMyPlugin 实例
        this.plugin = SMPL;
        // 调用 fetchCommunityPlugins 方法获取社区插件列表
        this.fetchCommunityPlugins();
    }

    /**
     * 获取指定的插件
     * @param id - 要获取的插件的 ID
     */
    public async pluginGithub(id: string) {
        // 如果社区插件列表未加载，则先加载
        if (!this.loaded) {
            await this.fetchCommunityPlugins();
        }
        // 从社区插件列表中查找对应插件的 repo 信息
        const pluginInfo = this.communityPlugins[id];

        if (!pluginInfo) {
            new Notice(`[插件管理器] 未知插件ID: ${id}`);
            return null;
        }
        window.open(`https://github.com/${pluginInfo.repo}`);
    }

    /**
     * 安装指定的插件
     * @param id - 要安装的插件的 ID
     * @param version - 要安装的插件的版本，默认为空字符串，表示不检查版本
     * @param enable - 安装后是否启用插件，默认为 false
     * @param github - 插件的 GitHub 仓库地址，默认为空字符串
     */
    public async pluginInstall(id: string, version: string = "", enable: boolean = false, github: string = "") {
        // 打印日志，记录开始安装插件的信息
        // console.log(`[插件管理器] 开始安装插件 -- ${id} - ${version} - ${enable} - ${github}`);
        // 如果社区插件列表未加载，则先加载 否则，触发防抖函数，定时刷新社区插件列表
        if (!this.loaded) await this.fetchCommunityPlugins(); else this.debounceFetch();

        // 获取 Obsidian 应用的插件注册表
        // @ts-ignore
        const pluginRegistry = this.plugin.app.plugins;

        // 标记是否需要安装插件
        let installFlag = false;
        // 获取插件的仓库地址，如果提供了 github 参数，则使用该参数，否则从社区插件列表中获取
        const repo = github !== "" ? github : this.communityPlugins[id]?.repo;
        console.log(repo)
        // 如果找不到插件的仓库地址，显示提示信息并返回
        if (!repo) {
            new Notice(`[插件管理器] 未知插件ID: ${id}`);
            return;
        }

        // 检查插件是否已经安装
        if (pluginRegistry.manifests[id]) {
            // 插件已安装，显示提示信息
            new Notice(`[插件管理器] 插件 ${pluginRegistry.manifests[id].name} 已安装`);
            // 如果指定了版本且与已安装的版本不同，则标记为需要安装
            if (version !== "" && version !== pluginRegistry.manifests[id]?.version) installFlag = true;
        } else {
            // 插件未安装，标记为需要安装
            installFlag = true;
        }

        // 如果需要安装插件
        if (installFlag) {
            // 从 GitHub 仓库获取插件的 manifest.json 文件
            const manifest = await fetch(`https://raw.githubusercontent.com/${repo}/HEAD/manifest.json`).then(r => r.json());
            // 如果版本为 "latest" 或空字符串，则使用 manifest 中的版本
            if (version.toLowerCase() === "latest" || version === "") version = manifest.version;
            // 调用插件注册表的 installPlugin 方法安装插件
            await pluginRegistry.installPlugin(repo, version, manifest);
        }

        // 根据 enable 参数决定是否启用或禁用插件
        if (enable) {
            // 启用插件
            await pluginRegistry.loadPlugin(id);
            await pluginRegistry.enablePluginAndSave(id);
        } else {
            // 禁用插件
            await pluginRegistry.disablePlugin(id);
        }
    }

    /**
     * 解析安装参数并调用 installPlugin 方法安装插件
     * @param params - 包含插件安装参数的对象
     */
    public async parsePluginInstall(params: ObsidianProtocolData) {
        // 解析参数，设置默认值
        let args = {
            id: params.id,
            version: params?.version ?? "",
            enable: ["", "true", "1"].includes(params.enable.toLowerCase()),
            github: params.github ?? "",
        };
        // 调用 installPlugin 方法安装插件
        this.pluginInstall(args.id, args.version, args.enable);
    }

    /**
     * 解析包含插件信息的字符串或对象，获取插件的相关信息
     * @param input - 包含插件信息的字符串或对象
     * @return - 返回解析后的插件信息对象，如果解析失败则返回 null
     */
    public async parsePluginGithub(params: ObsidianProtocolData) {
        // 解析参数，设置默认值
        let args = { id: params.id };
        await this.pluginGithub(args.id);
    }
}