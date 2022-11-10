const fs = require("node:fs");
const path = require("node:path");
const { Client, Collection, Events, GatewayIntentBits } = require("discord.js");
const { token, grToken } = require("./config.json");
const GrListener = require("./gumroad.js");

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

// Allows command handler to be dynamic, add / remove files as necessary from command line
client.commands = new Collection();
const commandsPath = path.join(__dirname, "commands");
const commandFiles = fs
  .readdirSync(commandsPath)
  .filter((file) => file.endsWith(".js"));

// Takes ^^^ and initializes the commands through the folder (/commands/)
for (const file of commandFiles) {
  const filePath = path.join(commandsPath, file);
  const command = require(filePath);
  client.commands.set(command.data.name, command);
}

// Construts activity type for the bot
const { ActivityType } = require("discord.js");

client.once("ready", () => {
  console.log("Bot up");
  client.user.setActivity("Collins Gumroad for a new product!", {
    type: ActivityType.Watching,
  });
});

// Send message to Discord channel on start (WHEN ENABLED)
client.on("ready", (client) => {
  // client.channels.cache.get("1034709909134131240").send("Bot up");

  // Starts listener on bot init
  let grBot = new GrListener(grToken, 2000);
  grBot.onNewProduct((products) => {
    //console.log(products);
    client.channels.cache
      .get("1034709909134131240")
      .send("There are new products available!");
    for (const product of products) {
      //console.log(product.name, product.short_url);
      client.channels.cache
        .get("1034709909134131240")
        .send(
          product.name +
            ": " +
            product.short_url 
        );
    }
  });

  grBot.start();
});

// Sends message to console
client.once(Events.ClientReady, () => {
  console.log("Ready!");
});

// Validates if command is being used. Needed for discord to properly work with command
client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  const command = client.commands.get(interaction.commandName);

  if (!command) return;

  try {
    await command.execute(interaction);
  } catch (error) {
    console.error(error);
    await interaction.reply({
      content: "There was an error while executing this command!",
      ephemeral: true,
    });
  }
});

client.login(token);
