/**
 * @name ChangeStatusWhilePlaying
 * @author RainWolf
 * @authorId 368676767160074241
 * @invite mNn5gfwdjC
 * @source https://github.com/RainWolf0603/ChangeStatusWhilePlaying/blob/main/ChangeStatusWhilePlaying.js
 * @updateUrl https://raw.githubusercontent.com/RainWolf0603/ChangeStatusWhilePlaying/main/ChangeStatusWhilePlaying.js
 * @website https://github.com/RainWolf0603/ChangeStatusWhilePlaying
 * @version 0.1
 */

 const config = {
    info: {
        name: "ChangeStatusWhilePlaying",
        authors: [
            {
                name: "RainWolf",
                discord_id: "389053119549538309",
            }
        ],
        version: "0.1",
        description: "可以在開指定遊戲時切換到指定狀態",
        github: "https://github.com/RainWolf0603/ChangeStatusWhilePlaying",
        github_raw: "https://raw.githubusercontent.com/RainWolf0603/ChangeStatusWhilePlaying/main/ChangeStatusWhilePlaying.js",
    },
    changelog: [
        {
            "title": "更新內容",
            "type": "fixed",
            "items": ["新增:  \n修復:  "]
        }
    ]
};

module.exports = !global.ZeresPluginLibrary ? class {
    constructor() {
        this._config = config;
    }

    load() {
        BdApi.showConfirmationModal("Library plugin is needed",
            `The library plugin needed for ${config.info.name} is missing. Please click Download Now to install it.`, {
                confirmText: "Download",
                cancelText: "Cancel",
                onConfirm: () => {
                    request.get("https://rauenzi.github.io/BDPluginLibrary/release/0PluginLibrary.plugin.js", (error, response, body) => {
                        if (error)
                            return electron.shell.openExternal("https://betterdiscord.net/ghdl?url=https://raw.githubusercontent.com/rauenzi/BDPluginLibrary/master/release/0PluginLibrary.plugin.js");

                        fs.writeFileSync(path.join(BdApi.Plugins.folder, "0PluginLibrary.plugin.js"), body);
                    });
                }
            });
    }

    start() { }

    stop() { }
} : (([Plugin, Library]) => {
    const Dispatcher = BdApi.findModuleByProps("dispatch", "subscribe");
    class ChangeStatusWhilePlaying extends Plugin {
        constructor() {
            super();
            this.getSettingsPanel = () => {
                    return this.buildSettingsPanel().getElement();
                };
        }

        async runningGamesChange(event) {
            const { games } = event;
            if(games.length > 0) {
                const StatusStore = BdApi.findModuleByProps('getStatus');
                const currentUser = BdApi.findModuleByProps('getCurrentUser').getCurrentUser();
                const status = StatusStore.getStatus(currentUser.id);
                if(status === 'dnd') return; //online, idle, dnd, invisible
                await BdApi.saveData("ChangeStatusWhilePlaying", "status", status)
                BdApi.findModuleByProps('updateRemoteSettings').updateRemoteSettings({status: "dnd"})
            }else if(games.length == 0){
                const savedStatus = BdApi.getData("ChangeStatusWhilePlaying", "status");
                BdApi.findModuleByProps('updateRemoteSettings').updateRemoteSettings({status: savedStatus})
            }
        }

        onStart() {
            Dispatcher.subscribe("RUNNING_GAMES_CHANGE", this.runningGamesChange);
        }

        onStop() {
            Dispatcher.unsubscribe("RUNNING_GAMES_CHANGE", this.runningGamesChange);
        }

    }

    return ChangeStatusWhilePlaying;
})(global.ZeresPluginLibrary.buildPlugin(config)); 
