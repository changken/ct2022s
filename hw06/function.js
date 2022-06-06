function morph(commands, unicode, defaultUPM) {
  //Function name must be "morph"
  var minNumber = (defaultUPM >> (defaultUPM.toString(2).length - 2)) * -10;
  var maxNumber = (defaultUPM >> (defaultUPM.toString(2).length - 2)) * 10;
  for (var i = 0; i < commands.length; i++) {
    var cmd = commands[i];
    var cmdProperty = Object.keys(cmd);
    for (var j = 0; j < cmdProperty.length; j++) {
      if (typeof commands[i][cmdProperty[j]] == 'number') {
        var randomInt = Math.random() * (maxNumber - minNumber) + minNumber;

        let randomN = Math.random() * (2 - 0) + 0;

        commands[i][cmdProperty[j]] += randomInt + fab(randomN);
        commands[i][cmdProperty[j]] = +commands[i][cmdProperty[j]].toFixed(2);
      }
    }
  }
  //You Must return an array, first element is path commands, second element is upm(optimal)
  return [commands];
}

function fab(n) {
  let fabA = [0, 1, 1];
  for (let i = 3; i <= n; i++) {
    fabA.push(fabA[i - 1] + fabA[i - 2]);
  }

  if (n < 3) {
    return fabA[n];
  }

  return fabA[n];
}
