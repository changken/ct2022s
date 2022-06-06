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

console.log(fab(1) === 1);
console.log(fab(10) === 55);
console.log(fab(12) === 144);
console.log(fab(14) === 377);
