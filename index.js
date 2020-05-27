require('dotenv').config();
const Discord = require('discord.js');
const client = new Discord.Client();
const sql = require("sqlite");
sql.open("userData.sqlite")


client.on('ready', ()=>{
	console.log('Logged in as ${client.user.tag}!');
	main_channel = client.channels.get("608400072681455690");
	sql.run("CREATE TABLE IF NOT EXISTS userData (userId TEXT, username TEXT, money INTEGER, UNIQUE(userId))");
});
//async function sleep(ms) {
//	return new Promise(resolve => setTimeout(resolve, ms));
//}

var cferid;
var cferbal;
var cfer;
var cf=0;
var activeCF=false;
client.on('message', async msg => {
	
	if (!msg.author.bot) {
		console.log("still going");

		//COMMANDS
		if (msg.content[0] == "/") {
			let splitMessage = msg.content.split(" ");
			if (splitMessage[0] == "/help") {
				f_help(msg);
			}
			else if (splitMessage[0] == "/cf") {
				f_cf(msg);
			}
			else if (splitMessage[0] == "/give" && splitMessage.length == 2 && !isNaN(splitMessage[1])) {
				f_give(msg);
			}
			else if (splitMessage[0] == "/bal") {
				f_bal(msg);
			}
			else if (splitMessage[0] == "/baltop") {
				f_baltop();
			}
			
		}
	}
});

	

function f_help(msg) {
	main_channel.send("**`----------------------------------------------------------------------\
		                \nCommands:                                                             \
		                \n1. /cf [amount]                                                       \
		                \n2. /cf accept                                                         \
                       		\n3. /cf cancel                                                         \
		                \n4. /bal                                                               \
		                \n5. /baltop                                                            \
		                \n----------------------------------------------------------------------   `**")

}
			
function f_cf(msg) {
	let splitMessage = msg.content.split(" ");
	id = msg.author.id;
	console.log(activeCF);
	// DID /CF ONLY
	if (splitMessage.length == 1) {
		main_channel.send("Proper Usage: /cf [amount], /cf accept, /cf cancel");
	}
				
	else if (splitMessage.length == 2) {
		if (splitMessage[1] == "accept" && activeCF) {
			if (id == cferid) {
				main_channel.send("You can't accept your own cf.");
				return;
            }
			console.log("cf accepted for a total of: " + 2 * cf);
			sql.get('SELECT * FROM userData WHERE userId =?', [id]).then(row => {
				var cash = (parseInt(row.money) - cf);
				console.log(1);
				if (cash < 0) {
					msg.reply("You do not have enough money to accept the cf");
				}
				else {
					console.log(2);
					sql.run('UPDATE userData SET money=? WHERE userId=?', [cash, id]);
					main_channel.send(msg.author + " has accepted the cf for a total of " + (2 * cf));
					if (Math.random() >= .5) {
						main_channel.send(msg.author + " won the cf for a total of " + (2 * cf));
						var cf2 = cf
						console.log(3);
						sql.get(`SELECT * FROM userData WHERE userId ="${msg.author.id}"`).then(row => {
							console.log("cf=" + cf2);
							console.log(4);
							id = msg.author.id;
							cash = parseInt(row.money) + (2 * cf2);//give cf money to player


							console.log("accepter: " + msg.author.id + "new bal: " + cash);
							sql.run('UPDATE userData SET money=? WHERE userId=?', [cash, id]);

						});
								
						console.log(5);
					}
					else {
						main_channel.send(cfer + " won the cf for a total of " + (2 * cf));
						console.log(cferbal)
						cferbal += 2 * cf;
						console.log(6);

						console.log("cfer: " + cfer + "new bal: " + cferbal);
						sql.run('UPDATE userData SET money=? WHERE userId=?', [cferbal, cferid]);

					}
					console.log(7);

					activeCF = false;
					cf = 0;
				}
			});
			console.log("sleep")
					



		}
        //cf cancel
		else if (splitMessage[1] == "cancel") {
			if (!activeCF) {
				main_channel.send("There is not an active cf to cancel");
				return;
			}
			if (cfer != msg.author) {
				main_channel.send("You can't cancel someone else's cf");
				return;
			}
			cferbal += cf;
			main_channel.send("Cf cancelled");
			console.log("cfer: " + cfer + "new bal after refund: " + cferbal);
			sql.run('UPDATE userData SET money=? WHERE userId=?', [cferbal, cferid]);
			activeCF = false;

        }
		//cf [amount]

		else if (!isNaN(splitMessage[1])) {
			if (activeCF) {
				msg.reply("There is already an active cf for " + cf);
			}
			else {
				cf = parseInt(splitMessage[1]);
				main_channel.send(msg.author + " has put up a cf for " + cf);
				activeCF = true;
				cfer = msg.author;
				cferid = msg.author.id;
				//remove money

				sql.all('SELECT * FROM userData WHERE userId = ?', [id]).then(rows => {
					rows.forEach(function (row) {
						var id = msg.author.id;
						var cash = parseInt(row.money) - cf;//remove money from player
						if (cash < 0) {
							main_channel.send("You do not have enough money to cf this amount");
						}
						else {
							sql.run('UPDATE userData SET money=? WHERE userId=?', [cash, id]);
							cferbal = cash;
						}
					})
				});
			}
		}
				
	}
}

function f_give(msg) {
    id = msg.author.id;
	sql.get('SELECT * FROM userData WHERE userId =?', [id]).then(row => {
		var cash = parseInt(splitMessage[1]) + parseInt(row.money);
		sql.run('UPDATE userData SET money=? WHERE userId=?', [cash, id]);
	}).catch(() => {
		console.error;
	});
}

function f_bal(msg) {
	id = msg.author.id; 
	sql.get('SELECT * FROM userData WHERE userId = ?', [id]).then(row => {
		msg.reply(" has " + row.money);
	});
}

function f_baltop() {
			main_channel.send("Top Balances:");
			sql.all(`SELECT * FROM userData ORDER BY money DESC`).then(rows => {
				var i = 1;
				ret = "**`----------------------------------------------------------------------\n";
				rows.forEach(function (row) {
					ret+=(i + ": " + row.username + ": " + row.money + "\n");
                   			i=i+1
				})
				ret +="----------------------------------------------------------------------`**"
				main_channel.send(ret);
			});
}

//function initialize() {
//	sql.run("CREATE TABLE IF NOT EXISTS userData (userId TEXT, username TEXT, money INTEGER, UNIQUE(userId))").then(() => {
//		sql.run("INSERT INTO userData (userId, username, money) VALUES (?, ?, ?)", [msg.author.id, sender.username, 0]);
//	});
//}

client.on('guildMemberAdd', member=>{
	member.send('I recommend skipping');
	sql.run("INSERT OR IGNORE INTO userData (userId, username, money) VALUES (?, ?, ?)", [member.id, member.user.username, 0]);
})

client.on('disconnect', event=> {
	if (activeCF) {
		cferbal += cf;

		console.log("cfer: " + cfer + "new bal after refund: " + cferbal);
		sql.run('UPDATE userData SET money=? WHERE userId=?', [cferbal, cferid]);
		activeCF = false;
		cf = 0;
    }
})

client.login(process.env.BOT_TOKEN);
