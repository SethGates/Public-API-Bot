const { SlashCommandBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("gumroad")
    .setDescription("Replies with Collins Gumroad!"),
  async execute(interaction) {
    await interaction.reply("https://turbovirgin.gumroad.com/");
  },
};

// node deploy-commands.js
