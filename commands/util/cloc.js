const Command = require('../../structures/Command');
const MessageEmbed = require('../../structures/MessageEmbed');
const { formatNumber } = require('../../util/Util');
const { promisify } = require('util');
const exec = promisify(require('child_process').execFile);
const path = require('path');

module.exports = class ClocCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'cloc',
			group: 'util',
			memberName: 'cloc',
			description: 'Responds with the bot\'s code line count.',
			guarded: true,
			clientPermissions: ['EMBED_LINKS']
		});

		this.cache = null;
	}

	async run(msg) {
		const cloc = this.cache || await this.cloc();
		const embed = new MessageEmbed()
			.setColor(0x00AE86)
			.setFooter(`${cloc.header.cloc_url} ${cloc.header.cloc_version}`)
			.addField(`❯ JS (${formatNumber(cloc.JavaScript.nFiles)})`, formatNumber(cloc.JavaScript.code), true)
			.addField(`❯ JSON (${formatNumber(cloc.JSON.nFiles)})`, formatNumber(cloc.JSON.code), true)
			.addField(`❯ MD (${formatNumber(cloc.Markdown.nFiles)})`, formatNumber(cloc.Markdown.code), true)
			.addBlankField(true)
			.addField(`❯ Total (${formatNumber(cloc.SUM.nFiles)})`, formatNumber(cloc.SUM.code), true)
			.addBlankField(true);
		return msg.embed(embed);
	}

	async cloc() {
		const { stdout, stderr } = await exec(
			path.join(__dirname, '..', '..', 'node_modules', '.bin', 'cloc'),
			['--json', '--exclude-dir=node_modules', path.join(__dirname, '..', '..')]
		);
		if (stderr) throw new Error(stderr.trim());
		this.cache = JSON.parse(stdout.trim());
		return this.cache;
	}
};
