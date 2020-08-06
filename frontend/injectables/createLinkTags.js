function create(arr, rel) {
  return arr
    .map(
      x => `
    <link\ rel="${rel}" href="${x}" />
    `
    )
    .join("");
}
module.exports = { create };
