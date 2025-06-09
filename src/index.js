process.on("unhandledRejection", (reason, promise) => {
    console.error("Unhandled Rejection:", reason);
  });
  
  process.on("uncaughtException", (error) => {
    console.error("Uncaught Exception:", error);
  });
  
  
  import dotenv from 'dotenv';
  dotenv.config();
  import fs from 'fs';
  const path = '/sys/class/thermal/thermal_zone0/temp';
  import { register } from 'module';
  import stream from 'stream';
  const internal = stream;
  import fetch from 'node-fetch';
import discord from "discord.js";

const {
    Client, 
    IntentsBitField, 
    EmbedBuilder, 
    SlashCommandBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    DMChannel,
    DirectMessages,
    partials,
    REST,
    Routes,
    ActivityType,
    ApplicationCommandOptionType,
    ChannelType,
    GatewayIntentBits,
    Partials,
} = discord;

  
  const client = new Client({
    intents: [
        IntentsBitField.Flags.Guilds,
        IntentsBitField.Flags.GuildMembers,
        IntentsBitField.Flags.GuildMessages,
        IntentsBitField.Flags.MessageContent,
        IntentsBitField.Flags.DirectMessages,
        IntentsBitField.Flags.DirectMessageTyping,
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.DirectMessages
    ],
    partials: [Partials.Channel, Partials.Message, Partials.User]
  });
    
//Settings
  const LOG_OWNER_COMMANDS = true //Enables or disables the logging of the owner of the bot's command usages.
  
  
  const afkUsers = new Map(); // Stores AFK users and their reasons
  
  const DMING_BLACKLIST_IDS = ""
  const LOG_CHANNEL_ID = "1381276283367067688"; // Replace with your log channel ID
  const BLACKLIST_ROLE_ID = "1381276347741110292" // Bot blacklist role
  const BOT_PERMS = "1381276394037706782" // Bot perms role
  const OWNER_ID = "612273903443902515"; // Bot owner's ID
  const STAFF_ROLE_ID = "1381354094949830756";
  
  const WARNING_LOG_FILE = 'warnings.log';
  const BLACKLIST_FILE = "blacklist.json";
  const WARN_LOG_CHANNEL_ID = '1381276512816337037'; // Replace with your logging channel ID
  let blacklisted_members = new Set();
  let warningCooldowns = new Map();
  const MESSAGE_STORAGE = new Map(); // Store the last sent message per channel
  
  
  
  
  
  
  const MESSAGE_DB = './messages.json';
  const TARGET_ROLE_ID = `1333000326239748208`;
  let messageCounts = {};
  let toggleState = true; // Variable to toggle
  
  // ✅ Load blacklist from file
  if (fs.existsSync(BLACKLIST_FILE)) {
    try {
        const data = fs.readFileSync(BLACKLIST_FILE, "utf8");
        const parsedData = JSON.parse(data);
        if (Array.isArray(parsedData)) {
            blacklisted_members = new Set(parsedData);
        }
    } catch (error) {
        console.error("Error loading blacklist file:", error);
    }
  }
  
  // ✅ Save blacklist to file
  function saveBlacklist() {
    fs.writeFileSync(BLACKLIST_FILE, JSON.stringify([...blacklisted_members], null, 2));
  }
  
  // Load message data from JSON
  if (fs.existsSync(MESSAGE_DB)) {
    messageCounts = JSON.parse(fs.readFileSync(MESSAGE_DB, 'utf8'));
  }
  
  client.on("ready", (c) => {
    console.log(`🟩 ${c.user.tag} is online.`);
    client.user.setActivity("Grow A Garden stock", { type: ActivityType.Watching, });
  });
  
  client.on("interactionCreate", async (interaction) => {
    if (!interaction.isChatInputCommand()) return;
        const commandName = interaction.commandName;
        const isBlacklisted = blacklisted_members.has(interaction.user.id);
        const blacklistStatus = isBlacklisted ? "❌ Blacklisted" : "✅ Not Blacklisted";
    
        const {options, user, channel } = interaction;
        const optionsString = options.data.length
            ? options.data.map((opt) => `**${opt.name}:** ${opt.value}`).join("\n")
            : "No options";
    
        const embed = new EmbedBuilder()
            .setTitle("Command Used")
            .setColor(isBlacklisted ? "Red" : "Blue")
            .addFields(
                { name: "User", value: `${user.tag} (${user.id})`, inline: true },
                { name: "Command", value: `/${commandName}`, inline: true },
                { name: "Options", value: optionsString, inline: false },
                { name: "Channel", value: channel ? `#${channel.name} (${channel.id})` : "DMs", inline: true },
                { name: "Blacklist Status", value: blacklistStatus, inline: true }
            )
            .setTimestamp()
            .setFooter({ text: "Command Log" });
      //logging system
        const logChannel = await client.channels.fetch(LOG_CHANNEL_ID);
        if (logChannel) {
            if (interaction.member.id === OWNER_ID) {
                if (LOG_OWNER_COMMANDS) {
                    logChannel.send({ embeds: [embed] });
                }
            } else {
                logChannel.send({ embeds: [embed] });
            }
        }
        /*if (interaction.member.id === "819935940319379576") {
            const me = interaction.guilds.members.cache.get(OWNER_ID)
            me.send({embeds: [embed]})
        }
            // Tracks command usage from a specific user and DM's it to me, myself and I.
            */
        // Blacklist check
        if (blacklisted_members.has(interaction.user.id)) {
            return interaction.reply({
                content: "You have been blacklisted from using this bot.",
                ephemeral: true,
            });
        }
    
        // Handle commands in a single switch case
        switch (commandName) {
            case "warn":
                handleWarn(interaction);
                break;
            case "warnings":
                handleWarnings(interaction);
                break;
            case "removewarn":
                handleRemoveWarn(interaction);
                break;
            case "blacklist":
                handleBlacklist(interaction);
                break;
            case "unblacklist":
                handleUnblacklist(interaction);
                break;
            case "set-status":
                handleSetStatus(interaction);
                break;
            case "whitelist":
                handleWhitelist(interaction);
                break;
            case "mute":
                handleMute(interaction);
                break;
            case "unmute":
                handleUnmute(interaction);
                break;
            case "say":
                handleSay(interaction);
                break;
            case "dm":
                handleDM(interaction);
                break;
            case "report":
                handleReport(interaction);
                break;
            case "membercount":
                handleMemberCount(interaction);
                break;
            case "afk":
                handleAFK(interaction);
                break;
            case "timeout":
                timeoutUser(interaction, user);
                break;
            default:
                console.log(`Unknown command: ${commandName}`);
        }
  });
  
  client.on("messageCreate", async (message) => {
    if (message.author.bot) return;
    
    const content = message.content.toLowerCase();
    const channel = message.channel
    switch (true) {
        case !message.guild:
            await handleDMforward(message);
            break;
        /*case channel.id === "1332994506613854278":
            await handleSticky(message);
            break;
        */
        case content === "!hinting":
            await handlehinting(message);
            break;
        case content === "!stock":
            await HandleStock(message);
            break;
        default:
    }
  });

  client.on("guildMemberAdd", (member) => {
    member.roles.add("1381351092788662334")
    const channel = member.guild.systemChannel;
    if (channel) {
        channel.send(`Welcome <@${member.id}> to ${member.guild.name}!`)
    }
  })











  async function handleWarn(interaction) {
    if (interaction.commandName === 'warn') {
        if (!interaction.member.roles.cache.has(STAFF_ROLE_ID) || !interaction.member.id === OWNER_ID) {
            return interaction.reply({ content: '❌ You do not have permission to warn members.', ephemeral: true });
        }
  
        const member = interaction.options.getMember('user');
        const reason = interaction.options.getString('reason') || 'No reason provided';
  
        if (!member) {
            return interaction.reply({ content: 'Please mention a valid member to warn.', ephemeral: true });
        }
  
        // Create an embed message
        const embed = new EmbedBuilder()
            .setColor(0xFF0000)
            .setTitle('User Warned')
            .addFields(
                { name: 'User', value: `${member.user.tag} (${member.id})`, inline: true },
                { name: 'Moderator', value: `${interaction.user.tag}`, inline: true },
                { name: 'Reason', value: reason, inline: false }
            )
            .setTimestamp();
            // Create a user embed message
            const user_embed = new EmbedBuilder()
            .setColor(0xFF0000)
            .setTitle('You have been warned in Nebula Fisch.')
            .addFields(
                { name: 'Reason', value: reason, inline: false }
            )
            .setTimestamp();
  
  
        warningCooldowns.set(member.id, Date.now());
        setTimeout(() => warningCooldowns.delete(member.id), 60000); // 1-minute cooldown
        await interaction.reply({ embeds: [embed]});
        member.send({embeds: [user_embed]});
        console.log(warningCooldowns.values)
  
        // Log the warning to a file
        const logMessage = `${new Date().toISOString()} | ${member.user.tag} (${member.id}) was warned by ${interaction.user.tag} | Reason: ${reason}\n`;
        fs.appendFile(WARNING_LOG_FILE, logMessage, err => {
            if (err) console.error('Failed to log warning:', err);
        });
  
        // Send log to the log channel
        const logChannel = client.channels.cache.get(WARN_LOG_CHANNEL_ID);
        if (logChannel) logChannel.send({ embeds: [embed] });
    }
  }
  async function handleWarnings(interaction) {
    if (interaction.commandName === 'warnings') {
        if (interaction.member.roles.cache.has(STAFF_ROLE_ID) || interaction.member.id === OWNER_ID) {
            const member = interaction.options.getMember('user');
            if (!member) {
                return interaction.reply({ content: 'Please mention a valid member.', ephemeral: true });
            }
    
            fs.readFile(WARNING_LOG_FILE, 'utf8', (err, data) => {
                if (err) {
                    console.error('Failed to read warning log:', err);
                    return interaction.reply({ content: 'An error occurred while accessing the warning log.', ephemeral: true });
                }
    
                let warnings = data.split('\n').filter(line => line.includes(member.id));
                if (warnings.length === 0) {
                    return interaction.reply({ content: `${member.user.tag} has no warnings.`, ephemeral: true });
                }
    
                const warningList = warnings.map((warning, index) => `**${index + 1}.** ${warning}`).join('\n');
                const embed = new EmbedBuilder()
                    .setColor(0xFFA500)
                    .setTitle(`Warnings for ${member.user.tag}`)
                    .setDescription(warningList)
                    .setTimestamp();
    
                interaction.reply({ embeds: [embed] });
            });
        }
    }
  }
  async function handleRemoveWarn(interaction) {
    if (interaction.commandName === 'removewarn') {
        if (interaction.member.id === OWNER_ID) console.log("You removed a warning bro.")
        if (interaction.member.roles.cache.has("1358133822796992512")) {
  
            const member = interaction.options.getMember('user');
            const warningIndex = interaction.options.getInteger('index');
            const reason = interaction.options.getString("reason");
            if (!member) {
                return interaction.reply({ content: 'Please mention a valid member to remove a warning from.', ephemeral: true });
            }
    
            fs.readFile(WARNING_LOG_FILE, 'utf8', (err, data) => {
                if (err) {
                    console.error('Failed to read warning log:', err);
                    return interaction.reply({ content: 'An error occurred while accessing the warning log.', ephemeral: true });
                }
    
                let warnings = data.split('\n').filter(line => line.includes(member.id));
                if (warnings.length === 0) {
                    return interaction.reply({ content: `${member.user.tag} has no warnings.`, ephemeral: true });
                }
    
                if (warningIndex === null || warningIndex < 1 || warningIndex > warnings.length) {
                    return interaction.reply({ content: `Invalid warning index. Please choose between 1 and ${warnings.length}.`, ephemeral: true });
                }
    
                warnings.splice(warningIndex - 1, 1); // Remove the selected warning
                const updatedData = data.split('\n').filter(line => !line.includes(member.id)).concat(warnings).join('\n');
    
                fs.writeFile(WARNING_LOG_FILE, updatedData, err => {
                    if (err) {
                        console.error('Failed to update warning log:', err);
                        return interaction.reply({ content: 'An error occurred while updating the warning log.', ephemeral: true });
                    }
                    
                    const embed = new EmbedBuilder()
                        .setColor(0x00FF00)
                        .setTitle('Warning Removed')
                        .setDescription(`Warning #${warningIndex} has been removed. \n Moderator: ${interaction.member.nickname} \n Reason: ${reason}`)
                        .setTimestamp();
  
                    interaction.reply({ embeds: [embed], ephemeral: true, });
    
                    // Log the removal to the log channel
                    const logChannel = client.channels.cache.get(WARN_LOG_CHANNEL_ID);
                    if (logChannel) logChannel.send({ embeds: [embed] });
                    member.send({embeds: [embed]});
                });
            });
        }
  } else {
    return interaction.reply({ content: 'You do not have permission to remove warnings.', ephemeral: true });
  }
  }
  async function handleBlacklist(interaction) {
    if (interaction.commandName === "blacklist") {
        const { commandName, options, user } = interaction;
        console.log(`Processing blacklist command for ${user.tag}`);
  
        if (!interaction.member.roles.cache.has(BLACKLIST_ROLE_ID) || !user.id === OWNER_ID) {
            return interaction.reply({ content: "❌ You do not have permission to use this command.", ephemeral: true });
        }
  
        const targetUser = options.getUser("user");
        if (targetUser.id === OWNER_ID) {
            return interaction.reply({ content: "❌ You are not able to blacklist the owner of the bot.", ephemeral: true });
        }
        if (!targetUser) {
            return interaction.reply({ content: "❌ You must mention a user to blacklist!", ephemeral: true });
        }
  
        // First, acknowledge the command with a reply
        await interaction.reply({ content: `🚫 **${targetUser.tag}** has been blacklisted!`, ephemeral: false });
  
        // Add user to blacklist set
        blacklisted_members.add(targetUser.id);
        console.log(`User ${targetUser.tag} added to blacklist`);
  
        // Save blacklist to file after the reply is sent
        saveBlacklist();
        console.log("Blacklist updated and saved to file.");
  
    }
  }
  async function handleUnblacklist(interaction) {
  try {
    const { commandName, options, user } = interaction;
    if (interaction.commandName === "unblacklist") {
        console.log(`Processing unblacklist command for ${user.tag}`);
  
        if (!interaction.member.roles.cache.has(BLACKLIST_ROLE_ID) || !user.id === OWNER_ID) {
            return interaction.reply({ content: "❌ You do not have permission to use this command.", ephemeral: true });
        }
  
        const targetUser = interaction.options.getUser("user");
        if (!targetUser) {
            return interaction.reply({ content: "❌ You must mention a user to unblacklist!", ephemeral: true });
        }
  
        if (!blacklisted_members.has(targetUser.id)) {
            return interaction.reply({ content: `❌ **${targetUser.tag}** is not blacklisted!`, ephemeral: true });
        }
  
        // First, acknowledge the command with a reply
        await interaction.reply({ content: `✅ **${targetUser.tag}** has been removed from the blacklist!`, ephemeral: false });
  
        // Remove user from blacklist
        blacklisted_members.delete(targetUser.id);
        console.log(`User ${targetUser.tag} removed from blacklist`);
  
        // Save blacklist to file after the reply is sent
        saveBlacklist();
        console.log("Blacklist updated and saved to file.");
    }
  } catch (error) {
    console.error("Error handling interaction:", error);
    return interaction.reply({ content: "❌ Something went wrong while processing your command.", ephemeral: true });
  }
  }
  async function handleSetStatus(interaction) {
    if (interaction.member.roles.cache.has(BLACKLIST_ROLE_ID)) {
        if (interaction.commandName === 'set-status') {
            const status = interaction.options.getString('status');
            const type = interaction.options.getString('type');
            const activityType = {
                "playing": ActivityType.Playing,
                "watching": ActivityType.Watching,
                "listening": ActivityType.Listening,
                "competing": ActivityType.Competing
            }[type.toLowerCase()] || ActivityType.Playing;
            
            client.user.setActivity(status, { type: activityType });
            await interaction.reply(`✅ Bot status updated to **${type} ${status}**`);
        }
    }
  }
  async function handleWhitelist(interaction) {
    if (interaction.commandName === "whitelist") {
        if (!interaction.member.roles.cache.has(BLACKLIST_ROLE_ID)) {
            interaction.reply({
                content: `You do not have the correct permissions to use the ${interaction.commandName} command.`,
                ephemeral: true,
            })
        }
        if (interaction.member.roles.cache.has(BLACKLIST_ROLE_ID)) {
            try {
                const wl_user = interaction.options.getMember("user");
    
                // Check if the user exists
                if (!wl_user) {
                    return interaction.reply({
                        content: "User not found or not in the server.",
                        ephemeral: true,
                    });
                }
    
    
                // Check if user already has the role
                if (wl_user.roles.cache.has(BOT_PERMS)) {
                    return interaction.reply({
                        content: "❌ This user is already whitelisted.",
                        ephemeral: true,
                    });
                }
    
                // Add the role
                await wl_user.roles.add(roleId);
                
                interaction.reply({
                    content: `✅ ${wl_user.user.tag} has been whitelisted!`,
                    ephemeral: true,
                });
    
            } catch (error) {
                console.error("Error in whitelist command:", error);
                interaction.reply({
                    content: "❌ An error occurred while processing the request.",
                    ephemeral: true,
                });
            }
        }
  
    }
  }
  
  async function handleSay(interaction) {
    if (interaction.commandName === "say") {
        
        const hasPermission = interaction.member.roles.cache.has() || interaction.user.id === OWNER_ID;
        const isBlacklisted = blacklisted_members.has(interaction.user.id);
        const blacklistStatus = isBlacklisted ? "❌ Blacklisted" : "✅ Not Blacklisted";
        if (hasPermission) {
            const text = interaction.options.getString("text")
            try {
                interaction.reply({content: "🟩 Message has been sent successfully", ephemeral: true,})
                interaction.channel.send(text)
            } catch (error) {
                interaction.reply({ content: `There was an issue performing this command. Error: ${error}`})
                console.log(error)
            }
        }
    }
  }
  async function handleDM(interaction) {
    if (interaction.commandName === "dm") {
        if (interaction.member.roles.cache.has(BOT_PERMS)) {
            const isBlacklisted = blacklisted_members.has(interaction.user.id);
            if (isBlacklisted) {
                interaction.reply({
                    content: "🚫 You have been blacklisted from using the /dm command. Open a support ticket if you believe this is an error.",
                    ephemeral: true,
                })
            }
            if (!isBlacklisted) {
                const text = interaction.options.get("text")
                interaction.reply({
                    content: "DM has been sent.",
                    ephemeral: true,
                })
                const user = interaction.options.getUser("member")
                user.send(`${text.value}`)
  
                const embed = new EmbedBuilder()
                .setTitle("Dm sent:")
                .setColor("Red")
                .addFields(
                    { name: "User", value: `${user} (${user.id})`, inline: false },
                    { name: "Moderator", value: `${interaction.member.displayName}`, inline: false },
                    { name: "Text:", value: `${text.value}`, inline: false}
                )
                .setTimestamp()
                .setFooter({ text: "Dm sent" });
                
                const DM_CHANNEL_ID = "1359174393745375312"
                const DM_CHANNEL = await client.channels.fetch(DM_CHANNEL_ID);
                if (DM_CHANNEL) DM_CHANNEL.send({ embeds: [embed] });
            }
        }
        }
  }
  
  
  async function handleReport(interaction) {
    if (interaction.commandName === "report") {
        const Report_Channel = await client.channels.fetch("1381569327261683813");
  
        const reason = interaction.options.getString("reason");
        const user = interaction.options.getMember("user");
  
        const ping = "<@" + interaction.member.id + ">"
        if (!user) return interaction.reply({content: "You need to mention a user.", ephemeral: true});
        if (!reason) return interaction.reply({content: "You need to give a reason.", ephemeral: true});
  
        try {
            const embed = new EmbedBuilder()
            .setTitle("Report")
            .setColor("Red")
            .addFields(
                { name: "User reported: ", value: `${user}`, inline: true},
                { name: "Reason: ", value: `${reason}`, inline: false},
                { name: "User: ", value: `${ping} (${interaction.member.id})`, inline: true},
            )
            /*const row = new ActionRowBuilder().addComponents(
                new ButtonBuilder().setCustomId('Aknowledge').setLabel('Aknowledge').setStyle(ButtonStyle.Success),
            ) */
        
            Report_Channel.send({embeds: [embed], /*components: [row]*/})
            interaction.reply({content: "Your report has been sent successfully.", ephemeral: true})
            Report_Channel.messa
  
        } catch (error) {
            interaction.reply({ content: `There was an error: ${error}`, ephemeral: true})
        }
    }
  }
  
  async function handleMemberCount(interaction) {
    if (interaction.commandName === "membercount") {
        const guild = interaction.guild;
        const memberCount = guild.memberCount;
  
        const embed = new EmbedBuilder()
            .setColor("Blue")
            .setTitle("👥 Server Member Count")
            .setDescription(`This server has **${memberCount}** members!`)
            .setTimestamp();
  
        await interaction.reply({ embeds: [embed] });
    }
  }
  
  
  async function handleAFK(interaction) {
    const reason = interaction.options.getString("reason") || "No reason provided.";
    const member = interaction.member;
  
    afkUsers.set(member.id, { reason, oldNickname: member.nickname });
  
    try {
        if (!member.nickname?.startsWith("[AFK]")) {
            await member.setNickname(`[AFK] ${member.nickname || member.user.username}`);
        }
    } catch (error) {
        console.error("Failed to update nickname:", error);
    }
  
    await interaction.reply({ content: `You are now AFK: **${reason}**`, ephemeral: false });
  };
  
  // Event listener for messageCreate
  client.on("messageCreate", async (message) => {
    if (!message.guild) return;
    if (message.author.bot) return;
  
    const member = message.member;
  
    // Remove AFK if user sends a message
    if (afkUsers.has(member.id)) {
        const { oldNickname } = afkUsers.get(member.id);
        afkUsers.delete(member.id);
  
        try {
            if (member.nickname?.startsWith("[AFK]")) {
                await member.setNickname(oldNickname || member.user.username);
            }
        } catch (error) {
            console.error("Failed to reset nickname:", error);
        }
  
        const msg = await message.reply("👋 Welcome back! Your AFK status has been removed.");
        setTimeout(() => msg.delete().catch(() => {}), 3000);
    }
  
    // Check if message mentions an AFK user
    if (message.mentions.members.size > 0) {
        message.mentions.members.forEach(async mentionedMember => {
            if (afkUsers.has(mentionedMember.id)) {
                const afkInfo = afkUsers.get(mentionedMember.id);
                await message.reply(`${mentionedMember.user.tag} is AFK: **${afkInfo.reason}**`);
            }
        });
    }
  })
  
  
  
  async function handleDMforward(message) {
    console.log("DM recieved.")
    const user = message.author
    const guild = client.guilds.cache.get(process.env.GUILD_ID)
    const channel = guild.channels.cache.get("1359174393745375312")
  
  
    if (user.id === DMING_BLACKLIST_IDS) return message.reply("You have been blacklisted from DMing Nebula Fisch. If you belive this was a mistake, please create a support ticket.")
    const embed = new EmbedBuilder()
    .setTitle("DM recieved:")
    .setColor("Blue")
    .addFields(
        { name: "User", value: `${user.tag} (${user.id})`, inline: false },
        { name: "Message: ", value: `${message.content}`, inline: false },
    )
    .setTimestamp()
    .setFooter({ text: "Dm recieved." });
    
    channel.send({embeds: [embed]})
  } 
  
  /*async function handleSticky(message) {
    const stickied_message = "# PLEASE VOUCH AFTER CLAIMING! 🎉";
  
    if (MESSAGE_STORAGE.has(message.channel.id)) {
        const oldMessage = MESSAGE_STORAGE.get(message.channel.id);
        await oldMessage.delete().catch(console.error); // Delete old message
    }
  
    const newMessage = await message.channel.send(stickied_message);
    MESSAGE_STORAGE.set(message.channel.id, newMessage); // Store new message
  }
  */
  
  async function handlehinting(message) {
    if (message.author.id === OWNER_ID) {
        message.channel.send("## What is hinting?  \n - Hinting is asking/ hinting towards a promo. \n Why should i not do it? \n -  It will Decrease your promo chance. \n## How can I avoid hinting? \n -  Simply dont ask for promotions, dont tell people to promote you. If sombody gets promoted dont just say awh why not me? instead congratulate them on their achievement, maybe if you congratulate them and be respectful to higher ranks it will increase your chance!")
    }
  }
  
  
  
  async function timeoutUser(interaction) {
    const duration = interaction.options.getInteger("duration");
    const user = interaction.options.getUser("user");
    if (interaction.member.roles.cache.has("1333865315850915910")) { //Manager role
        const member = interaction.guild.members.cache.get(user.id);
        const moderator = interaction.guild.members.cache.get(interaction.user.id)
        const reason = interaction.options.getString("reason")
        const TimeoutLogChannel = interaction.guild.channels.cache.get("1347699150770409504")
        const embed = new EmbedBuilder()
        .setTitle(`user timeout.`)
        .setColor("Red")
        .addFields(
            { name: "User", value: `${member}`, inline: true },
            { name: "Duration", value: `${duration} minute(s)`, inline: false },
            { name: "Reason:", value: `${reason}`, inline: true },
            { name: "Moderator:", value: `${moderator}`, inline: true },
        )
        .setFooter({ text: "Timeout issued." });
  
  
  
  
  
  
        if (!member) {
            return interaction.reply({ content: "User not found.", ephemeral: true });
        }
        if (!member.moderatable) {
            return interaction.reply({ content: "I can't timeout this user.", ephemeral: true });
        }
        if (!duration || isNaN(duration) || duration <= 0) {
            return interaction.reply({ content: "Invalid duration. Please provide a valid number of minutes.", ephemeral: true });
        }
        try {
            const durationMs = duration * 60 * 1000;
            console.log(`Timeout duration: ${duration}`);
            await member.timeout(durationMs, reason);
  
            await interaction.reply({ content: `${user} has been timed out for ${duration} minutes. ⏳ \n Reason: ${reason}`, ephemeral: false });
            TimeoutLogChannel.send({ embeds: [embed] });
    
            // Notify the user
            await user.send(`You have been timed out in **${interaction.guild.name}** for **${duration} minute(s)**.`)
                .catch(() => console.log("Couldn't DM the user."));
    
            // Automatically remove timeout after duration
            setTimeout(async () => {
                try {
                    await member.timeout(null); // Remove timeout
                    await user.send(`Your timeout in **${interaction.guild.name}** has expired.`)
                        .catch(() => console.log("Couldn't DM the user."));
                } catch (error) {
                    console.error("Error removing timeout:", error);
                }
            }, duration * 60 * 1000);
    
        } catch (error) {
            console.error("Timeout Error:", error);
            return interaction.reply({ content: "There was an error trying to timeout this user.", ephemeral: true });
        }
    } else {
        interaction.reply({content: "You do not have the correct permissions to use this command.", ephemeral: true})
    }
  }
  
  async function HandleStock(message) {
    const button = new ButtonBuilder()
    .setLabel("Stock's website")
    .setStyle(ButtonStyle.Link)
    .setURL("https://growagarden.gg/stocks")


    const row = new ActionRowBuilder().addComponents(button);

    await message.channel.send({ components: [row] })
  }
  client.login(process.env.TOKEN);
  fetch("http://192.168.68.108:3001/api/push/XA87q4VclI?status=up&msg=OK&ping=")
  setInterval(() => {
    fetch("http://192.168.68.108:3001/api/push/XA87q4VclI?status=up&msg=OK&ping=")
  }, 60000);