const { SlashCommandBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("Your command name here!")
    .setDescription("Your commands description here"),
  async execute(interaction) {
    await interaction.reply("Your command response here");
  },
};

// node deploy-commands.js
