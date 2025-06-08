require("dotenv").config();
const { REST, Routes, ApplicationCommandOptionType, ApplicationCommand} = require("discord.js");
const commands = [
    //say command
    {
        name: "say",
        description: "Sends what you tell it to.",
        options: [
            {
                name: "text",
                description: "Make the bot say something.",
                type: ApplicationCommandOptionType.String,
                required: true,
            },
        ]
    },
    {
        name: "dm",
        description: "Dm's a member",
        options: [
            {
                name: "member",
                description: "The user you want to DM",
                type: ApplicationCommandOptionType.User,
                required: true,
            },
            {
                name: "text",
                description: "What you want to tell the user.",
                type: ApplicationCommandOptionType.String,
                required: true,
            },
        ]
    },
    {
        name: "blacklist",
        description: "Blacklist a user from using the bot.",
        options: [
            {
                name: "user",
                description: "The user to blacklist.",
                type: ApplicationCommandOptionType.User,
                required: true,
            }
        ]
    },
    {
        name: "unblacklist",
        description: "Removes a user from the blacklist",
        options: [
            {
                name: "user",
                description: "The user to remove from the blacklist",
                type: ApplicationCommandOptionType.User,
                required: true,
            },
        ]
    },
    {
        name: "blacklisted",
        description: "Lists all users who are currently blacklisted.",
    },

    {
        name: "whitelist",
        description: "Whitelists a user to be able to use the bot.",
        options: [
            {
                name: "user",
                description: "The user you want to whitelist.",
                type: ApplicationCommandOptionType.User,
            }
        ]
    },
    {
        name: "unwhitelist",
        description: "Removes someone from being able to use the bot.",
        options: [
            {
                name: "user",
                description: "The user you want to unwhitelist.",
                type: ApplicationCommandOptionType.User,
            }
        ]
    },
    {
        name: "warn",
        description: "Warns a specific user.",
        options: [
            {
                name: "user",
                description: "The user you would like to warn",
                type: ApplicationCommandOptionType.User,
                required: true,
            },
            {
                name: "reason",
                description: "The reason to warn this user",
                type: ApplicationCommandOptionType.String,
                required: true,
            },
        ]
    },
    {
        name: "removewarn",
        description: "Remove a specific warning for a user",
        options: [
            {
                name: "user",
                description: "The user to remove a warning from",
                type: ApplicationCommandOptionType.User,
                required: true,
            },
            {
                name: "index",
                description: "The warning number to remove \n (You can see the number by running /warnings)",
                type: ApplicationCommandOptionType.Integer,
                required: true,
            },
            {
                name: "reason",
                description: "The reason to remove this warning",
                type: ApplicationCommandOptionType.String,
                required: true,
            },
        ]
    },
    {
        name: "warnings",
        description: "Lists all warnings a user has",
        options: [
            {
                name: "user",
                description: "The user you want to see the warnings for",
                type: ApplicationCommandOptionType.User,
                required: true,
            }
        ]
    },

    {
        name: "report",
        description:  "Reports a member in our server.",
        options: [
            {
                name: "user",
                description: "The user you wish to report.",
                type: ApplicationCommandOptionType.User,
                required: true,
            },
            {
                name: "reason",
                description: "The reason you wish to report this user.",
                type: ApplicationCommandOptionType.String,
                required: true,
            }
        ]
    },

    {
        name: "membercount",
        description: "Shows the number of members in the server"
    },
    {
        name: "afk",
        description: "Set yourself as AFK with a reason.",
        options: [
            {
                name: "reason",
                description: "The reason for going AFK.",
                required: true,
                type: ApplicationCommandOptionType.String,
            }
        ]
    },

];
const rest = new REST({ version: "10" }).setToken(process.env.TOKEN);
(async () => {
    try {
        console.log("Registering slash commands...");

        await rest.put(
            Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID),
            { body: commands}
        );

        console.log("Slash commands were registered successfully!");
    } catch (error) {
        console.log(`There was an error: ${error}`);
    }
})();