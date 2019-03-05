var utils = require('utils');

var roundsToWin = 15;

var getCardList = function() {
  var cards = [];
  var cardNames = ['4', '5', '6', '7', 'Q', 'J', 'K', 'A', '2', '3'];
  var suits = ['\u2663', '\u2665', '\u2660', '\u2666'];

  for(var c = 0; c < cardNames.length; c++) {
  	for(var c2 = 0; c2 < suits.length; c2++) {
  	  var name = cardNames[c] + ' ' + suits[c2];
  	  var color = c2 == 0 || c2 == 2 ? '\u00A78' : '\u00A7c';
  	  var card = { name: name, color: color };

  	  switch(name) {
  	  	case '4 \u2663': {
  	  	  card.power = 13;
  	  	  break;
  	  	}

  	  	case '7 \u2665': {
  	  	  card.power = 12;
  	  	  break;
  	  	}

  	  	case 'A \u2660': {
  	  	  card.power = 11;
  	  	  break;
  	  	}

  	  	case '7 \u2666': {
  	  	  card.power = 10;
  	  	  break;
  	  	}

  	  	default: {
  	  	  card.power = c;
  	  	}
  	  }

  	  cards.push(card);
  	}
  }

  return cards;
}


var cards = getCardList();
var playersCards = {};

var invites = [];
var games = [];
var trucoList = [];
var sixList = [];
var nineList = [];
var twelveList = [];

var generateRandomCards = function() {
  var cardsNotInGame = JSON.parse(JSON.stringify(cards));
  var randomCards = [];

  echo(utils.player('Macintosh'), cards.length);

  for(var c = 0; c < 2; c++) {
  	randomCards[c] = [];
    for(var c2 = 0; c2 < 3; c2++) {
  	  var randomNumber = Math.floor(Math.random() * cardsNotInGame.length);
  	  randomCards[c].push(cardsNotInGame[randomNumber]);
  	  cardsNotInGame.splice(randomNumber, 1);
    }
  }

  return randomCards;
}

var echoPlayerCards = function(name, cards) {
  var player = utils.player(name);

  echo(player, '\u00A7bSuas cartas sao:');
  for(var c = 0; c < cards.length; c++) {
  	var card = cards[c];
  	player.sendMessage(card.color + ' ' + card.name);
  } 
}

var invitePlayer = function(player, otherPlayerName) {
  if(!otherPlayerName) {
  	return player.sendMessage('\u00A7eO nome do Marreco esta faltando');
  }

  var otherPlayer = utils.player(otherPlayerName);

  if(!otherPlayer) {
  	return player.sendMessage('\u00A7eO Marreco ' + otherPlayerName + ' esta Offline');
  }

  var otherPlayerAlreadyInvited = false;
  var otherPlayerAlreadyPlaying = false;

  invites.forEach(function(invite) {
  	if(invite.challenger == otherPlayerName || invite.invited == otherPlayerName) {
  	  otherPlayerAlreadyInvited = true;
  	}
  });

  if(otherPlayerAlreadyInvited) {
  	return player.sendMessage('\u00A7eO Marreco ' + otherPlayerName + ' ja foi Desafiado');
  }

  games.forEach(function(game) {
  	if(game.players[0] == otherPlayerName || game.players[1] == otherPlayerName) {
  	  otherPlayerAlreadyPlaying = true;
  	}
  });

  if(otherPlayerAlreadyPlaying) {
  	return player.sendMessage('\u00A7eO Marreco ' + otherPlayerName + ' ja esta Jogando (e provavelmente perdendo)');
  }

  invites.push({
  	challenger: player.name,
  	invited: otherPlayerName
  });

  player.sendMessage('\u00A7e O Convite foi enviado para o Marreco');
  otherPlayer.sendMessage('\u00A7e O Jogador ' + player.name + ' te desafiou para uma partida de Truco');
  otherPlayer.sendMessage('\u00A7a Digite truco aceitar para Aceitar o Convite');
  otherPlayer.sendMessage('\u00A7c Ou digite truco amarelar para Recusar o Convite');

  setTimeout(function() {
    removeInvite(otherPlayerName);
  }, 20000); 
}

var getInvite = function(invited) {
  var returnInvite = null;

  invites.forEach(function(invite, index) {
  	if(invite.invited == invited) {
  	  returnInvite = invite;
  	}
  });

  return returnInvite;	
}

var removeInvite = function(invited) {
  invites.forEach(function(invite, index) {
  	if(invite.invited == invited) {
  	  invites.splice(index, 1);
  	}
  });
}

var removeGame = function(player) {
  games.forEach(function(game, index) {
  	if(games.player[0] == player || games.player[1] == player) {
  	  games.splice(index, 1);
  	}
  });
}

var acceptInvite = function(player) {
  var invite = getInvite(player.name);

  if(!invite) {
  	player.sendMessage('\u00A7e O Convite foi expirado');
  }

  var gameId = Math.random();

  games.push({
  	id: gameId,
  	players: [invite.challenger, player.name],
  	atual: 0,
  	hand: 0,
  	round: 0,

  	firstRoundWin: null,
  	roundValue: 1,
  	playersRoundValue: [0, 0],
  	playersValue: [0, 0],
  	playersCards: [],
  	sendedCards: [],
  });

  removeInvite(player);

  player.sendMessage('\u00A72 Comecou a Diversao');
  utils.player(invite.challenger).sendMessage('\u00A72 Comecou a Diversao');

  startRound(player);
}

var updateGame = function(game) {
  games.forEach(function(gameFe, index) {
  	if(gameFe.id == game.id) {
  	  games[index] = game;
  	}
  });
}

var getGame = function(player) {
  game = null;

  games.forEach(function(gameFe) {
  	if(gameFe.players.indexOf(player.name) !== -1) {
  	  game = gameFe;
  	}
  });

  return game;
}

var startRound = function(player) {
  var game = getGame(player);

  utils.player(game.players[1]).sendMessage('\u00A73 Voce ' + game.playersValue[1] + ' vs ' + game.playersValue[0] + ' ' + game.players[0]);
  utils.player(game.players[0]).sendMessage('\u00A73 Voce ' + game.playersValue[0] + ' vs ' + game.playersValue[1] + ' ' + game.players[1]);

  if(game.playersValue[0] >= roundsToWin || game.playersValue[1] >= roundsToWin) {
  	utils.player(game.players[0]).sendMessage('');
  	utils.player(game.players[0]).sendMessage('\u00A72-------------------------------');
  	utils.player(game.players[0]).sendMessage('\u00A72              TEMOS UM VENCEDOR     ');
  	utils.player(game.players[0]).sendMessage('\u00A72-------------------------------');
  	utils.player(game.players[0]).sendMessage('');

  	utils.player(game.players[1]).sendMessage('');
  	utils.player(game.players[1]).sendMessage('\u00A72-------------------------------');
  	utils.player(game.players[1]).sendMessage('\u00A72             TEMOS UM VENCEDOR     ');
  	utils.player(game.players[1]).sendMessage('\u00A72-------------------------------');
  	utils.player(game.players[1]).sendMessage('');

  	if(game.playersValue[0] >= roundsToWin) {
  	  utils.player(game.players[0]).sendMessage('\u00A72' + game.players[0] + ' Venceu de ' + game.players[1]);
  	  utils.player(game.players[1]).sendMessage('\u00A72' + game.players[0] + ' Venceu de ' + game.players[1]);
    } else {
  	  utils.player(game.players[0]).sendMessage('\u00A72' + game.players[1] + ' Venceu de ' + game.players[0]);
  	  utils.player(game.players[1]).sendMessage('\u00A72' + game.players[1] + ' Venceu de ' + game.players[0]);    	
    }

    utils.player(game.players[0]).sendMessage('');
    utils.player(game.players[1]).sendMessage('');

    return removeGame(player);
  }

  var playersCards = generateRandomCards();
  game.playersCards = playersCards;

  echoPlayerCards(game.players[1], playersCards[1]);
  echoPlayerCards(game.players[0], playersCards[0]);

  if(game.players[1] == roundsToWin - 1 && game.players[0] != roundsToWin - 1) {
  	game.ironHand = true;
  	game.ironHandAccepted = false;
  	utils.player(game.players[1]).sendMessage('\u00A7a Para aceitar a mao de ferro digite truco aceitarmao');
  	utils.player(game.players[1]).sendMessage('\u00A7c Para recusar a mao de ferro digite truco recusarmao');
  	utils.player(game.players[0]).sendMessage('\u00A7b O outro jogador ira ver se aceitara a mao de ferro');
  	return updateGame(game);
  } else if (game.players[0] == roundsToWin - 1 && game.players[1] != roundsToWin - 1) {
  	game.ironHand = true;
  	game.ironHandAccepted = false;
  	utils.player(game.players[0]).sendMessage('\u00A7a Para aceitar a mao de ferro digite truco aceitarmao');
  	utils.player(game.players[0]).sendMessage('\u00A7c Para recusar a mao de ferro digite truco recusarmao');
  	utils.player(game.players[1]).sendMessage('\u00A7b O outro jogador ira ver se aceitara a mao de ferro');
  	return updateGame(game);
  } else {
  	game.ironHand = false;
  }

  game.atual = game.hand;
  utils.player(game.players[game.atual]).sendMessage('\u00A7b Sua vez de Jogar');

  if(!game.round) {
  	utils.player(game.players[game.atual]).sendMessage('\u00A7b Para Jogar uma carta, digite truco jogarcarta [numero da carta (1, 2 ou 3)]');
  }

  updateGame(game);
}

var sendCard = function(player, cardNumber) {
  var game = getGame(player);

  if(!game) {
  	return player.sendMessage('\u00A7e Voce nem esta jogando, marreco!');
  }  

  if(game.players[game.atual] !== player.name) {
  	return player.sendMessage('\u00A7e Nao e voce que joga, marreco!');
  }  

  var card = game.playersCards[game.atual][cardNumber - 1];

  if(!card || card.alreadyUsed) {
    return player.sendMessage('\u00A7e Voce esta jogando uma carta que nem existe, marreco!');
  }

  var waitingPlayerResponse = false;

  trucoList.forEach(function(truco) {
  	if(truco.waiting) {
  	  waitingPlayerResponse = true;
  	}
  });

  sixList.forEach(function(six) {
  	if(six.waiting) {
  	  waitingPlayerResponse = true;
  	}
  });

  nineList.forEach(function(nine) {
  	if(nine.waiting) {
  	  waitingPlayerResponse = true;
  	}
  });

  twelveList.forEach(function(twelve) {
  	if(twelve.waiting) {
  	  waitingPlayerResponse = true;
  	}
  });

  if(waitingPlayerResponse) {
  	return player.sendMessage('\u00A7e Espere a resposta do outro jogador marreco!');
  }

  if(game.ironHand ? game.ironHandAccepted : false) {
  	return player.sendMessage('\u00A7e Esperando aceitar a mao de ferro..');
  }

  game.playersCards[game.atual][cardNumber - 1].alreadyUsed = true;

  try {
  var anotherPlayer = utils.player(game.players[game.atual === 0 ? 1 : 0]);

  player.sendMessage('\u00A77 Voce jogou a carta ' + card.name);
  anotherPlayer.sendMessage('\u00A77 ' + player.name + ' jogou a carta ' + card.name);

  if(game.sendedCards.length) {
  	if(card.power > game.sendedCards[0].power) {
  	  player.sendMessage('\u00A7a Voce fez com o ' + card.name);
  	  anotherPlayer.sendMessage('\u00A77 ' + player.name + ' fez com o ' + card.name);
  	
  	  game.playersRoundValue[game.atual]++;

  	  if(game.firstRoundWin === null) {
  	  	game.firstRoundWin = game.atual;
  	  }

  	  if(game.playersRoundValue[game.atual] != 2 && game.firstRoundWin !== null) {
  	    player.sendMessage('\u00A7b Torne');
  	  }
  	}

  	if(card.power < game.sendedCards[0].power) {
  	  anotherPlayer.sendMessage('\u00A7a Voce fez com o ' + game.sendedCards[0].name);
  	  player.sendMessage('\u00A77 ' + anotherPlayer.name + ' fez com o ' + game.sendedCards[0].name); 

  	  game.atual = game.atual == 0 ? 1 : 0;
  	  game.playersRoundValue[game.atual]++;

  	  if(game.firstRoundWin === null) {
  	  	game.firstRoundWin = game.atual;
  	  }

  	  if(game.playersRoundValue[game.atual] != 2 && game.firstRoundWin !== null) {
  	    anotherPlayer.sendMessage('\u00A7b Torne');
  	  }	  
  	}

  	if(card.power == game.sendedCards[0].power) {
  	  utils.player(game.players[game.atual === 0 ? 1 : 0]).sendMessage('\u00A76 Rodada Empatada');
  	  
  	  if(game.playersRoundValue[0] == 0 && game.playersRoundValue[1] == 0) {
  	    player.sendMessage('\u00A76 Rodada Empatada');
  	  }

  	  game.playersRoundValue[game.atual]++;
  	  game.playersRoundValue[game.players[game.atual === 0 ? 1 : 0]]++;

  	  game.atual = game.atual == 0 ? 1 : 0;

  	  if(game.playersRoundValue[game.atual] != 2 && game.firstRoundWin !== null) {
	    anotherPlayer.sendMessage('\u00A7b Sua vez de Jogar');  
  	  }		  	
  	}

  	game.sendedCards = [];
  } else {
  	game.atual = game.atual == 0 ? 1 : 0;  
  	game.sendedCards.push(card);
	utils.player(game.players[game.atual]).sendMessage('\u00A7b Sua vez de Jogar');

	if(!game.round) {
	  utils.player(game.players[game.atual]).sendMessage('\u00A7b Para Jogar uma carta, digite truco jogarcarta [numero da carta (1, 2 ou 3)]');
	}  	
  }

  if(game.playersRoundValue[game.atual] == 2 && game.firstRoundWin !== null) {
  	if(game.playersRoundValue[0] === 2 && game.playersRoundValue[1] == 2) {
  	  if(game.firstRoundWin === game.players[0]) {
  	    game.atual = 0;
  	  } else {
  	  	game.atual = 1;
  	  }
  	}

  	player.sendMessage('\u00A73' + game.players[game.atual] + ' ganhou ' + game.roundValue + ' ' + (game.roundValue == 1 ? 'tento' : 'tentos'));
  	anotherPlayer.sendMessage('\u00A73' + game.players[game.atual] + ' ganhou ' + game.roundValue + ' ' + (game.roundValue == 1 ? 'tento' : 'tentos'));
  	resetRound(game, player);
  	return;
  }

  updateGame(game);
  } catch(error) {
  	player.sendMessage(error.message);
  } 
}

var resetRound = function(game, player, automaticPlayerIncreaseValue) {
  automaticPlayerIncreaseValue = automaticPlayerIncreaseValue === undefined ? true : automaticPlayerIncreaseValue;

  if(automaticPlayerIncreaseValue) {
    game.playersValue[game.atual] += game.roundValue;
  }	

  game.roundValue = 1;
  game.playersRoundValue = [0, 0];
  game.firstRoundWin = null;
  game.round++;
  game.hand = game.hand == 0 ? 1 : 0; 
  game.atual = game.hand; 
  game.sendedCards = [];

  trucoList.forEach(function(truco, index) {
  	if(truco.to == player.name || truco.by == player.name) {
  	  trucoList.splice(index, 1);
  	}
  });  

  sixList.forEach(function(six, index) {
  	if(six.to == player.name || six.by == player.name) {
  	  sixList.splice(index, 1);
  	}
  });  

  nineList.forEach(function(nine, index) {
  	if(nine.to == player.name || nine.by == player.name) {
  	  nineList.splice(index, 1);
  	}
  });

  twelveList.forEach(function(twelve, index) {
  	if(twelve.to == player.name || twelve.by == player.name) {
  	  twelveList.splice(index, 1);
  	}
  });
  
  updateGame(game);
  startRound(player);
}

var trucar = function(player) {
  var game = getGame(player);
  var anotherPlayer = utils.player(game.players[game.atual === 0 ? 1 : 0]);

  if(!game) {
  	return player.sendMessage('\u00A7e Voce nem esta jogando, marreco!');
  }  

  if(game.players[game.atual] !== player.name) {
  	return player.sendMessage('\u00A7e Nao e voce que joga, marreco!');
  }

  if(game.roundValue >= 3) {
  	return player.sendMessage('\u00A7e Ja esta trucado, marreco!');
  }

  if(game.ironHand) {
  	player.sendMessage('\u00A7c CARAMBA MARRECO!');
  	player.sendMessage('\u00A7c CARAMBA MARRECO!');
  	player.sendMessage('\u00A7c CARAMBA MARRECO!');
  	player.sendMessage('\u00A7c NÃO SE TRUCA NA MAO DE FERRO!');
    game.playersValue[game.atual === 0 ? 1 : 0] += roundsToWin;
    resetRound(game, player);
  }

  trucoList.push({
  	gameId: game.id,
  	by: player.name,
  	to: anotherPlayer.name,
  	waiting: true
  });

  player.sendMessage('\u00A7a Voce pediu truco!');
  anotherPlayer.sendMessage('\u00A7c Voce foi trucado! Digite truco fugir para fugir');
  anotherPlayer.sendMessage('\u00A7a Voce foi trucado! Digite truco aceitartruco para aceitar');
  anotherPlayer.sendMessage('\u00A72 Voce foi trucado! Digite truco seis para pedir seis');
}

var askSix = function(player) {
  var game = getGame(player);
  var anotherPlayer = utils.player(game.players[game.atual === 0 ? 1 : 0]);

  if(!game) {
  	return player.sendMessage('\u00A7e Voce nem esta jogando, marreco!');
  }

  var truco;

  trucoList.forEach(function(trucoFe) {
  	if(trucoFe.to == player.name) {
  	  truco = trucoFe;
  	}
  });

  if(!truco) {
  	return player.sendMessage('\u00A7e Nao esta trucado, marreco!');
  }  

  if(game.roundValue >= 6) {
  	return player.sendMessage('\u00A7e Ja esta valendo seis, marreco!');
  }

  game.roundValue = 3;
  truco.waiting = false;
  updateGame(game);

  var anotherPlayer = utils.player(truco.by);

  sixList.push({
  	gameId: game.id,
  	by: player.name,
  	to: anotherPlayer.name,
  	waiting: true
  });

  player.sendMessage('\u00A7a Voce pediu seis!');
  anotherPlayer.sendMessage('\u00A7c SEEEEEEIS! Digite truco fugir para fugir');
  anotherPlayer.sendMessage('\u00A7a SEEEEEEIS! Digite truco aceitarseis para aceitar');
  anotherPlayer.sendMessage('\u00A72 SEEEEEEIS! Digite truco nove para pedir nove');   
}

var askNine = function(player) {
  var game = getGame(player);
  var anotherPlayer = utils.player(game.players[game.atual === 0 ? 1 : 0]);

  if(!game) {
  	return player.sendMessage('\u00A7e Voce nem esta jogando, marreco!');
  }

  var six;

  sixList.forEach(function(sixFe) {
  	if(sixFe.to == player.name) {
  	  six = sixFe;
  	}
  });

  if(!six) {
  	return player.sendMessage('\u00A7e Nao valendo seis, marreco!');
  }

  if(game.roundValue >= 9) {
  	return player.sendMessage('\u00A7e Ja esta valendo none, marreco!');
  }

  game.roundValue = 6;
  six.waiting = false;
  updateGame(game);

  var anotherPlayer = utils.player(six.by);

  nineList.push({
  	gameId: game.id,
  	by: player.name,
  	to: anotherPlayer.name,
  	waiting: true
  });

  player.sendMessage('\u00A7a Voce pediu nove!');
  anotherPlayer.sendMessage('\u00A7c NOOOOOOOOOOOOOOVE! Digite truco fugir para fugir');
  anotherPlayer.sendMessage('\u00A7a NOOOOOOOOOOOOOOVE! Digite truco aceitarnove para aceitar');
  anotherPlayer.sendMessage('\u00A72 NOOOOOOOOOOOOOOVE! Digite truco doze para pedir doze');   
}

var acceptTruco = function(player) {
  var game = getGame(player);
  var anotherPlayer = utils.player(game.players[game.atual]);

  if(!game) {
  	return player.sendMessage('\u00A7e Voce nem esta jogando, marreco!');
  }

  var truco;

  trucoList.forEach(function(trucoFe) {
  	if(trucoFe.to == player.name) {
  	  truco = trucoFe;
  	}
  });

  if(!truco) {
  	return player.sendMessage('\u00A7e Nao esta trucado, marreco!');
  }

  game.roundValue = 3;
  truco.waiting = false;
  updateGame(game);

  player.sendMessage('\u00A7a Voce aceitou o Truco!');
  anotherPlayer.sendMessage('\u00A7a ' + player.name + ' aceitou o Truco!');
}

var acceptSix = function(player) {
  var game = getGame(player);
  var anotherPlayer = utils.player(game.players[game.atual === 0 ? 1 : 0]);

  if(!game) {
  	return player.sendMessage('\u00A7e Voce nem esta jogando, marreco!');
  }

  var six;

  sixList.forEach(function(sixFe) {
  	if(sixFe.to == player.name) {
  	  six = sixFe;
  	}
  });

  if(!six) {
  	return player.sendMessage('\u00A7e Nao esta pedindo seis, marreco!');
  }

  game.roundValue = 6;
  six.waiting = false;
  updateGame(game);

  player.sendMessage('\u00A7a Voce aceitou o Seis!');
  anotherPlayer.sendMessage('\u00A7a ' + player.name + ' aceitou o Seis!');
}

var acceptNine = function(player) {
  var game = getGame(player);
  var anotherPlayer = utils.player(game.players[game.atual]);

  if(!game) {
  	return player.sendMessage('\u00A7e Voce nem esta jogando, marreco!');
  }

  var nine;

  nineList.forEach(function(nineFe) {
  	if(nineFe.to == player.name) {
  	  nine = nineFe;
  	}
  });

  if(!nine) {
  	return player.sendMessage('\u00A7e Nao esta pedindo nove, marreco!');
  }

  game.roundValue = 9;
  nine.waiting = false;
  updateGame(game);

  player.sendMessage('\u00A7a Voce aceitou o Nove!');
  anotherPlayer.sendMessage('\u00A7a ' + player.name + ' aceitou o Nove!');
}

var askTwelve = function(player) {
  var game = getGame(player);
  var anotherPlayer = utils.player(game.players[game.atual === 0 ? 1 : 0]);

  if(!game) {
  	return player.sendMessage('\u00A7e Voce nem esta jogando, marreco!');
  }

  var nine;

  nineList.forEach(function(nineFe) {
  	if(nineFe.to == player.name) {
  	  nine = nineFe;
  	}
  });

  if(!nine) {
  	return player.sendMessage('\u00A7e Nao valendo nove, marreco!');
  }

  if(game.roundValue >= 12) {
  	return player.sendMessage('\u00A7e Ja esta valendo doze, marreco!');
  }

  game.roundValue = 9;
  nine.waiting = false;
  updateGame(game);

  var anotherPlayer = utils.player(nine.by);

  twelveList.push({
  	gameId: game.id,
  	by: player.name,
  	to: anotherPlayer.name,
  	waiting: true
  });

  player.sendMessage('\u00A7a Voce pediu doze!');
  anotherPlayer.sendMessage('\u00A7c DOOOOOOOOOOOOOOOZEEEE! Digite truco fugir para fugir');
  anotherPlayer.sendMessage('\u00A7a DOOOOOOOOOOOOOOOZEEEE! Digite truco aceitardoze para aceitar');  	
}

var acceptTwelve = function(player) {
  var game = getGame(player);
  var anotherPlayer = utils.player(game.players[game.atual === 0 ? 1 : 0]);

  if(!game) {
  	return player.sendMessage('\u00A7e Voce nem esta jogando, marreco!');
  }

  var twelve;

  twelveList.forEach(function(twelveFe) {
  	if(twelveFe.to == player.name) {
  	  twelve = twelveFe;
  	}
  });

  if(!twelve) {
  	return player.sendMessage('\u00A7e Nao esta pedindo doze, marreco!');
  }

  game.roundValue = 12;
  twelve.waiting = false;
  updateGame(game);

  player.sendMessage('\u00A7a Voce aceitou o Doze!');
  anotherPlayer.sendMessage('\u00A7a ' + player.name + ' aceitou o Doze!');
}

var acceptIronHand = function(player) {
  var game = getGame(player);

  if(!game.ironHand) {
  	return player.sendMessage('\u00A7e Nao esta na mao de ferro, marreco!');
  }

  if(game.ironHandAccepted) {
    return player.sendMessage('\u00A7e Voce ja aceitou a mao, marreco!');	
  }

  if(game.players[game.players.indexOf(player.name)] !== roundsToWin - 1) {
    return player.sendMessage('\u00A7e Voce nao esta na mao de ferro, marreco!');
  }

  player.sendMessage('\u00A7b Voce aceitou a mao!');

  game.roundValue = 3;
  game.atual = game.hand;
  utils.player(game.players[game.atual]).sendMessage('\u00A7b Sua vez de Jogar');

  if(!game.round) {
  	utils.player(game.players[game.atual]).sendMessage('\u00A7b Para Jogar uma carta, digite truco jogarcarta [numero da carta (1, 2 ou 3)]');
  }

  updateGame(game);
}

var refuseHand = function(player) {
  var game = getGame(player);
  var anotherPlayer = utils.player(game.players[game.players.indexOf(player.name) == 0 ? 1 : 0]);

  if(!game.ironHand) {
  	return player.sendMessage('\u00A7e Nao esta na mao de ferro, marreco!');
  }

  if(game.ironHandAccepted) {
    return player.sendMessage('\u00A7e Voce ja aceitou a mao, marreco!');	
  }

  if(game.players[game.players.indexOf(player.name)] !== roundsToWin - 1) {
    return player.sendMessage('\u00A7e Voce nao esta na mao de ferro, marreco!');
  }

  player.sendMessage('\u00A7b Voce nao aceitou a mao!');
  anotherPlayer.sendMessage('\u00A7b O outro jogador nao aceitou a mao!');

  game.playersValue[game.players.indexOf(player.name) == 0 ? 1 : 0]++;
  resetRound(game, player);
}

var run = function(player) {
  var game = getGame(player);

  if(!game) {
  	return player.sendMessage('\u00A7e Voce nem esta jogando, marreco!');
  }

  utils.player(game.players[0]).sendMessage('\u00A7c O marreco fugiu!');
  utils.player(game.players[1]).sendMessage('\u00A7c O marreco fugiu!');

  game.playersValue[game.players.indexOf(player.name) == 0 ? 1 : 0] += game.roundValue;
  resetRound(game, player, false);
}

var refuseInvite = function(player) {
  var invite = getInvite(player.name);

  if(!invite) {
  	player.sendMessage('\u00A7e O Convite foi expirado');
  }

  removeInvite(player.name);
  player.sendMessage('\u00A7e E um amarelao mesmo');
  utils.player(invite.challenger).sendMessage('\u00A7e O marreco ' + player.name + ' amarelou');  
}

var help = function(player) {
  player.sendMessage('');
  player.sendMessage('\u00A7e----------------------');
  player.sendMessage('\u00A7eComandos do Truco');
  player.sendMessage('\u00A7e desafiar [player] - Desafiar Player para Jogar Truco');
  player.sendMessage('\u00A7e aceitar - Aceita Partida de Truco');
  player.sendMessage('\u00A7e amarelar - Recusa Partida de Truco');
  player.sendMessage('\u00A7e jogarcarta [numero da carta] - Joga carta');
  player.sendMessage('\u00A7e trucar - Pede truco');
  player.sendMessage('\u00A7e fugir - Foge da rodada');
  player.sendMessage('\u00A7e aceitartruco - Aceita o Truco');
  player.sendMessage('\u00A7e seis - Pede seis');
  player.sendMessage('\u00A7e aceitarseis - Aceita o seis');
  player.sendMessage('\u00A7e nove - Pede nove');
  player.sendMessage('\u00A7e aceitarnove - Aceita o nove');
  player.sendMessage('\u00A7e doze - Pede doze');
  player.sendMessage('\u00A7e aceitardoze - Aceita o doze');
  player.sendMessage('\u00A7e----------------------');
  player.sendMessage('');
}

function truco(parameters, player) {
  var param = parameters[0];

  switch(param) {
  	case 'desafiar': {
  	  invitePlayer(player, parameters[1]);
  	  break;
  	}

  	case 'aceitar': {
  	  acceptInvite(player);
  	  break;
  	}

  	case 'amarelar': {
  	  refuseInvite(player);
  	  break;
  	}

  	case 'jogarcarta': {
  	  sendCard(player, parameters[1]);
  	  break;
  	}

  	case 'trucar': {
  	  trucar(player);
  	  break;
  	}

  	case 'fugir': {
  	  run(player);
  	  break;
  	}

  	case 'aceitartruco': {
  	  acceptTruco(player);
  	  break;
  	}

  	case 'seis': {
  	  askSix(player);
  	  break;
  	}
  	case 'aceitarseis': {
  	  acceptSix(player);
  	  break;
  	}

  	case 'nove': {
  	  askNine(player);
  	  break;
  	}

  	case 'aceitarnove': {
  	  acceptNine(player);
  	  break;
  	}

  	case 'doze': {
  	  askTwelve(player);
  	  break;
  	}

  	case 'aceitardoze': {
  	  acceptTwelve(player);
  	  break;
  	}

  	case 'aceitarmao': {
  	  acceptIronHand(player);
  	  break;
  	}

  	case 'recusarmao': {
  	  refuseHand(player);
  	  break;
  	}

  	case 'help': {
  	  help(player);
  	  break;
  	}

  	default: {
  	  player.sendMessage('\u00A7e Digite algum comando valido ou "truco help" marreco!');
  	}
  }
}

command('truco', truco);

events.playerChat(function(event) {
  var words = event.message.split(' ');

  if(words[0] == 'truco') {
  	words.splice(0, 1);
  	truco(words, event.player);
  	event.setCancelled(true);
  }
});