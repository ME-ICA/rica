# Rica

[![DOI](https://zenodo.org/badge/391155862.svg)](https://zenodo.org/badge/latestdoi/391155862)

As part of the ME-ICA pipeline, `Rica` (Reports for ICA) provides a reporting tool for ICA decompositions performed with [tedana](https://github.com/ME-ICA/tedana) and [aroma](https://github.com/ME-ICA/aroma).

**Pronunciation:** [ˈrika]. For an audio recording on how to pronounce Rica [see here](https://easypronunciation.com/en/spanish/word/rica).

## About

`Rica` originally came out as an alternative to the reports provided by [tedana](https://github.com/ME-ICA/tedana), with the aim of making manual classification of ICA components possible. At the same time, the tool aspires to be of value for ICA decompositions made with tools other than `tedana`. `Rica` assumes you're working with files that mimic the outputs of `tedana`.

## Using Rica online

Just head over to https://rica-fmri.netlify.app and have fun!

## Using Rica locally

### Installation

`Rica` can be installed by cloning this repository and executing the following command in the cloned repository:

```npm install```

In order to run the tool locally, two options exist:

#### 1. Using a localhost

By executing the `npm start` command in the cloned repository, `Rica` will open in a new browser tab at [http://localhost:3000](http://localhost:3000) and you will be able to use the tool.

#### 2. Compiling the tool

You could also compile the project so that you can use the tool just by opening an HTML file. For that, it is necessary to execute the following commands in the cloned repository.

```bash
npm run build
npx gulp
mv build/index.html build/rica.html
open build/rica.html
```

> Pro tip: when you open rica.html for the first time, BOOKMARK IT 😉

## Using Rica

Even if Rica is designed to be simple to use, you might want to see how you can use the app by watching this [tutorial video](https://www.loom.com/share/ad37cf6f3c2d41e48721f62168a8284e).

## Getting involved

Want to learn more about our plans for developing `Rica`? Have a question, comment, or suggestion? Open or comment on one of our issues!
