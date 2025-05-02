import { Notice, Platform } from 'obsidian';
import { exec } from 'child_process';
import Manager from 'main';
import { existsSync } from 'fs';
import * as path from 'path';

/**
 * 打开文件或文件夹的操作系统命令。
 * @param i18n - 国际化对象，用于显示操作结果的通知。
 * @param dir - 要打开的文件夹路径。
 * @description 根据操作系统执行相应的命令来打开文件夹。在Windows上使用'start'命令，在Mac上使用'open'命令。
 * 如果操作成功，显示成功通知；如果失败，显示错误通知。
 */
export const managerOpen = (dir: string, manager: Manager) => {
	if (Platform.isDesktop) {
		exec(`start "" "${dir}"`, (error) => {
			if (error) { new Notice(manager.translator.t('通用_失败_文本')); } else { new Notice(manager.translator.t('通用_成功_文本')); }
		});
	}
	if (Platform.isMacOS) {
		exec(`open ${dir}`, (error) => {
			if (error) { new Notice(manager.translator.t('通用_失败_文本')); } else { new Notice(manager.translator.t('通用_成功_文本')); }
		});
	}
}



export async function updatePlugin(modal: QPSModal, matchingItem: PluginInstalled, commPlugins: Record<string, PluginCommInfo>) {
	// 从 matchingItem 中解构出插件的 ID 和版本号
	const { id, version } = matchingItem;
	// 检查插件是否有目录信息，如果没有则显示提示信息并返回
	if (!matchingItem.dir) { new Notice(`Not a published plugin`, 2500); return }
	// 获取插件目录的完整路径
	const filePath = modal.app.vault.adapter.getFullPath(matchingItem.dir);
	// 如果无法获取完整路径则返回
	if (!filePath) return

	// 如果是桌面平台
	if (Platform.isDesktop) {
		// 构建插件开发路径下的 package.json 文件路径
		const isDevPath = path.join(filePath, "package.json");
		// 检查该文件是否存在，如果存在则返回，不进行更新操作
		if (existsSync(isDevPath)) { return; }
	}

	// 异步获取插件的清单文件信息
	const manifest = await getManifest(modal, id);
	// 如果无法获取清单文件则返回
	if (!manifest) return
	// 异步检查插件是否有可用的发布版本
	const hasRelease = await getReleaseVersion(modal, id, manifest)
	// 获取清单文件中的插件版本号
	const lastVersion = manifest.version

	// 如果插件 ID 不在 commPlugins 对象中，说明不是已发布插件，显示提示信息
	if (!(id in commPlugins)) { new Notice(`Not a published plugin`, 2500); }
	// 如果没有获取到清单文件，显示提示信息
	else if (!manifest) { new Notice(`No manifest in ${commPlugins[id].repo}`, 3500) }
	// 如果插件没有可用的发布版本，显示提示信息
	else if (!hasRelease) { new Notice(`can't update, version ${manifest.version} in repo has not been released!`) }
	// 如果清单文件中的版本号小于等于当前已安装的版本号，说明已经是最新版本，显示提示信息
	else if (lastVersion <= version) { new Notice(`Already last version ${lastVersion}`, 2500) }
	// 满足更新条件，进行插件更新操作
	else {
		try {
			// 调用 app.plugins.installPlugin 方法安装插件的新版本
			await modal.app.plugins.installPlugin(commPlugins[id!].repo, lastVersion, manifest);
			// 显示更新成功的提示信息
			new Notice(`version ${version} updated to ${lastVersion}`, 2500);
			// 更新 matchingItem 中的插件版本号
			matchingItem.version = lastVersion
			// 调用插件的 installedUpdate 方法进行更新操作
			await modal.plugin.installedUpdate();
		} catch {
			// 安装过程中出现错误，打印错误信息
			console.error("install failed");
		}
	}
	// 将插件的 toUpdate 标志设置为 false，表示不需要更新
	matchingItem.toUpdate = false
	// 重新打开模态框
	await reOpenModal(modal);
}