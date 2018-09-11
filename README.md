# Will it rain today?

## Part 1

Demo web app to demonstrate how to use Service Worker.

https://will-it-rain-today-c287a.firebaseapp.com/

> This repo accompanies a two-part tutorial written for *net magazine*

In this two-part tutorial we’re going to show you how to progressively enhance
your site or webapp with a Service Worker to give you faster loading times and
offline support.

In part 1 we’re going to learn about Service Worker registration and set up a
bare bones worker that will cache and serve our static assets, delivering a
huge performance boost on subsequent loads.

Next month, in part 2, we’ll learn how to cache dynamic API responses and give
our demo app full offline support.

The `master` branch contains the starting point.

The `tutorial` branch contains the completed tutorial. With each step flagged
with a *tag*. See below for more info.

If you're looking for part 2 you need the `tutorial-2` branch.

## Install

    npm install

## Requirements

 - Node 6.9.0 or higher
 - npm 3 or higher

## Commands

Development server

    npm start

Create build

    npm run build

## Step-by-step

Each step of the tutorial has been saved as a tag.

Open the Branch dropdown above, switch to the Tags tab and choose the step you
want to see.

![image](https://user-images.githubusercontent.com/1104814/39257089-88c06328-48a8-11e8-8549-cd80d93c1dae.png)

---

Made by Daniel Crisp - [danielcrisp.com](https://danielcrisp.com)
