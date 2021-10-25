# Can I email data…

caniemail.com provides email clients support tables for HTML and CSS features. This is an npm package that serves the latest caniemail data pulled from the [API](https://www.caniemail.com/api/data.json). The package is automatically published whenever there is an update to the data.

## Install

```sh
npm i caniemail
```

## Usage

```js
const caniemail = require("caniemail");

console.log(caniemail.nicenames);
// => "family": { "gmail": "Gmail", "outlook": "Outlook",...
```

## Credits

Can I email is an amazing project by [@HTeuMeuLeu](https://twitter.com/HTeuMeuLeu) and the team at [Tilt Studio](https://www.tilt-studio.fr/).
