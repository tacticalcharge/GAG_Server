  import dotenv from 'dotenv';
  dotenv.config();
  import fs from 'fs';
  const path = '/sys/class/thermal/thermal_zone0/temp';
  import { register } from 'module';
  import stream from 'stream';
  const internal = stream;
  import fetch from 'node-fetch';
import * as commands from './commands.js';
import { client } from './client.js'; // gets your client
import {GatewayIntentBits, IntentsBitField, Partials, ActivityType, ButtonBuilder, ButtonStyle, ActionRowBuilder, EmbedBuilder } from 'discord.js';

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
                commands.handleWarn(interaction);
                break;
            case "warnings":
                commands.handleWarnings(interaction);
                break;
            case "removewarn":
                commands.handleRemoveWarn(interaction);
                break;
            case "blacklist":
                commands.handleBlacklist(interaction);
                break;
            case "unblacklist":
                commands.handleUnblacklist(interaction);
                break;
            case "set-status":
                commands.handleSetStatus(interaction);
                break;
            case "whitelist":
                commands.handleWhitelist(interaction);
                break;
            case "mute":
                commands.handleMute(interaction);
                break;
            case "unmute":
                commands.handleUnmute(interaction);
                break;
            case "say":
                commands.handleSay(interaction);
                break;
            case "dm":
                commands.handleDM(interaction);
                break;
            case "report":
                commands.handleReport(interaction);
                break;
            case "membercount":
                commands.handleMemberCount(interaction);
                break;
            case "afk":
                commands.handleAFK(interaction);
                break;
            case "timeout":
                commands.timeoutUser(interaction, user);
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