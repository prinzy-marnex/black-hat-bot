const { DATABASE } = require("./database");
const { DataTypes } = require("sequelize");
const path = require("path");
const config = require("../../config");

const packageJson = require("../../package.json");

const SettingsDB = DATABASE.define(
    "BotSettings",
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        key: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
        },
        value: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
    },
    {
        tableName: "bot_settings",
        timestamps: true,
    },
);

const DEFAULT_SETTINGS = {
    PREFIX: ".",
    OWNER_NAME: "𝑴𝒂𝒓𝒍𝒐𝒏 𝑴𝒂𝒓𝒔𝒉𝒎𝒆𝒍𝒍𝒐🥷",
    OWNER_NUMBER: "263779778079",
    BOT_NAME: "𝐁𝐋𝐀𝐂𝐊 𝐇𝐀𝐓-𝐌𝐃",
    FOOTER: "𝑪𝒓𝒆𝒂𝒕𝒆𝒅 𝒃𝒚 𝑷𝒓𝒊𝒏𝒛𝒚𝑨𝒓𝒅 & 𝑴𝒂𝒓𝒔𝒉𝒎𝒆𝒍𝒍𝒐🥷",
    CAPTION: "©𝟐𝟎𝟐𝟓 𝐁𝐋𝐀𝐂𝐊 𝐇𝐀𝐓-𝐌𝐃 𝐕𝟓",
    BOT_PIC: "https://www.image2url.com/r2/default/images/1776338825845-caa56d77-b8dd-46d7-8380-753c6519a578.jpg",
    VERSION: packageJson.version || "5.0.0",
    MODE: config.MODE || "public",
    WARN_COUNT: "3",
    TIME_ZONE: config.TIME_ZONE || "Africa/Harare",
    DM_PRESENCE: "online",
    GC_PRESENCE: "online",
    CHATBOT: "false",
    CHATBOT_MODE: "inbox",
    STARTING_MESSAGE: "true",
    ANTIDELETE: "indm",
    ANTI_EDIT: "indm",
    ANTICALL: "false",
    ANTICALL_MSG: "*_📞 Auto Call Reject Mode Active. 📵 No Calls Allowed!_*",
    AUTO_LIKE_STATUS: config.AUTO_LIKE_STATUS || "true",
    AUTO_READ_STATUS: config.AUTO_READ_STATUS || "true",
    STATUS_LIKE_EMOJIS: "🎀,❤️,💜,🤍,💙",
    AUTO_REPLY_STATUS: "false",
    STATUS_REPLY_TEXT: "*ʏᴏᴜʀ sᴛᴀᴛᴜs ᴠɪᴇᴡᴇᴅ sᴜᴄᴄᴇssғᴜʟʟʏ ✅*",
    AUTO_REACT: "off",
    AUTO_REPLY: "false",
    AUTO_READ_MESSAGES: "off",
    AUTO_BIO: "false",
    AUTO_BLOCK: "",
    YT: "youtube.com/@Clever_Tech_Nexus",
    NEWSLETTER_JID: "70515360313473@newsletter",
    GC_JID: "FHT9hXCbu1z4XiPbn7HKMw",
    NEWSLETTER_URL: "https://whatsapp.com/channel/0029VbD7IqH3bbUxd7hQXV3h",
    BOT_REPO: "prinzy-marnex/black-hat-md",
    PACK_NAME: "𝐁𝐋𝐀𝐂𝐊 𝐇𝐀𝐓-𝐌𝐃",
    PACK_AUTHOR: "𝑴𝒂𝒓𝒍𝒐𝒏 𝑴𝒂𝒓𝒔𝒉𝒎𝒆𝒍𝒍𝒐🥷",
    SUDO_NUMBERS: "",
    PM_PERMIT: "false",
    ANTIVIEWONCE: "indm",
};

let initialized = false;

const GROUP_ONLY_SETTINGS = [
    "WELCOME_MESSAGE",
    "GOODBYE_MESSAGE",
    "GROUP_EVENTS",
    "ANTILINK",
];

async function initializeSettings() {
    if (initialized) return;

    await SettingsDB.sync();

    await SettingsDB.destroy({
        where: { key: GROUP_ONLY_SETTINGS },
    });

    for (const [key, defaultValue] of Object.entries(DEFAULT_SETTINGS)) {
        await SettingsDB.findOrCreate({
            where: { key },
            defaults: { key, value: defaultValue },
        });
    }

    initialized = true;
    console.log("✅ Bot Settings Initialized");
}

async function getSetting(key) {
    if (!initialized) await initializeSettings();

    const record = await SettingsDB.findOne({ where: { key } });
    if (record) {
        return record.value;
    }

    return DEFAULT_SETTINGS[key] || null;
}

async function setSetting(key, value) {
    if (!initialized) await initializeSettings();

    const [record, created] = await SettingsDB.findOrCreate({
        where: { key },
        defaults: { key, value },
    });

    if (!created) {
        record.value = value;
        await record.save();
    }

    return true;
}

async function getAllSettings() {
    if (!initialized) await initializeSettings();

    const records = await SettingsDB.findAll();
    const settings = {};
    for (const record of records) {
        settings[record.key] = record.value;
    }
    return settings;
}

async function resetSetting(key) {
    if (!initialized) await initializeSettings();

    const defaultValue = DEFAULT_SETTINGS[key];
    if (defaultValue !== undefined) {
        await setSetting(key, defaultValue);
        return defaultValue;
    }
    return null;
}

async function resetAllSettings() {
    if (!initialized) await initializeSettings();

    for (const [key, defaultValue] of Object.entries(DEFAULT_SETTINGS)) {
        await setSetting(key, defaultValue);
    }
    return true;
}

module.exports = {
    SettingsDB,
    DEFAULT_SETTINGS,
    initializeSettings,
    getSetting,
    setSetting,
    getAllSettings,
    resetSetting,
    resetAllSettings,
};
