# GTM Tracking

- [Intro](#intro)
- [Setup](#setup)
- [Environments](#environments)
- [Pageviews](#pageviews)
- [Custom Events](#custom-events)
  - [Triggers and Tags](#triggers-and-tags)
  - [Variables](#variables)
  - [Interaction Events](#interaction-events)
    - [Clicks](#clicks)
    - [Element Visibility](#element-visibility)
    - [Other Interactions](#other-interactions)
  - [Data Events](#data-events)
    - [Request Events](#request-events)
    - [Session Events](#session-events)
- [User ID Tracking](#user-id-tracking)
- [Debugging](#debugging)

## Intro

Google Tag Manager is an advanced tool that allows custom triggers to send tracking data to a variety of services, most commonly Google Analytics.

### Advantages:

- Free
- Deeply integrates with Google Analytics
- Custom integrations with 3rd party services that can quickly be toggled on/off.
- Advanced interaction tracking out of the box for complex events such as element visibility, etc.

### Disadvantages:

- Generally doesn't have SPAs in mind.
- High learning curve and difficult to set up.

The code and instructions here are intended to let you easily set up complex tracking in a way optimally set up for SPAs in general and Bedrock in particular.

## Setup

- Create a new GTM container and GA property (assuming GA).
- Set `GTM_CONTAINER_ID` in `services/web/env.conf` to your new container ID.
- In GTM create a new custom variable of type `Google Analytics Settings` and enter your GA tracking id. Name it `Google Analytics ID`. This will link GTM to GA.

## Environments

Best practice is to set up separate environments for testing and production. To do this, repeat the steps above to create a new GTM container and GA property for production and set the container ID in `deployment/environments/production/services/web-deployment.yml`. The container ID provided in `services/web/env.conf` will be used for local dev and staging environments, with production tracking properly isolated.

## Pageviews

GTM pageviews assume a traditional web app where each page is a round trip to the server. The following steps will ensure that pageviews are captured in the context of a SPA each time the URL changes:

- Create a new trigger of type `Custom Event` with the `Event name` of `pageview`, and set to fire on `All Custom Events`. Name it `Pageview`.
- Create a new tag of type `Google Analytics: Universal Analytics`. Set the `Track Type` to `Page View`, and `Google Analytics Settings` to the `{{Google Analytics ID}}` variable created in setup. Set the trigger to the `Pageview` trigger created above. Name it `Pageviews`.
- Create a new tag of type `Custom HTML` with trigger `All Pages`. Copy the content of `spa.html` in this directory into the `HTML` field. This is a custom script that allow pageview tracking of SPAs. For more, see the comments in `spa.html`.

## Custom Events

In GTM, anything not a pageview is considered a "custom event", and we can define these any way we want. Our strategy here will be to separate these into [interaction events](#interaction-events) and [data events](#data-events). Interaction events are concerned with the UI and require a single attribute in the code that will serve as a hook. Data events are a layer of structure that Bedrock provides on top of custom events that leverages interactions with the API and session storage.

## Triggers and Tags

GTM is powerful and there are a few ways to set it up. For example it's possible to set up a single trigger and tag to pass through all click events. However this level of abstraction quickly offers diminishing returns. It also has the disadvantage of not being clear for people unfamiliar with GTM.

After some experimentation, creating one tag for each "event" seems to be the most intuitive approach. Keep in mind that "tags" are cheap. A "tag" is simply a way of saying "when trigger X happens, send some data to a service" (usually GA), and this all happens in the browser which means it's fast. Having one tag per "event" means that you can easily see visually what is being tracked and give those events a name that aligns with a spreadsheet, etc.

## Variables

Custom events can capture anything in the app state. GTM provides many "Built-In Variables" for commonly tracked data such as page title, URL, etc. However "Custom Variables" allow access to anything in the page (for example the text of an element unrelated to the one clicked on). Bedrock additionally pushes as much context as possible in its [data events](#data-events) that can be accessed via "Data Layer Variables". These can be combined together to have full control over the final data pushed through.

## Interaction Events

UI interaction can easily be set up with GTM but require a hook to identify elements, which means changes to the code. To keep this minimal we will set up a single data attribute that will allow GTM to target specific elements:

- Create a custom variable of type `Data Layer Variable`. Set the `Data Layer Variable Name` to `gtm.element.dataset.gtm`. Set the name to `GTM Attribute` and save.
- Elements that need to be identified can now simply add a `data-gtm` attribute that will identify them, for example: `<button data-gtm="home-page-cta">`. An element `id` could also be used here but `data-gtm` serves as a signal in the code that the element is being tracked.

**Note**: Each UI interaction event will require a separate trigger and tag as per our [general strategy](#triggers-and-tags) above. This can be cumbersome, but it will allow all customization to happen in GTM which means updates can easily be made without code access or the overhead of deploying new code. You can also "copy" triggers and tags to make creation easier (menu on the top right).

## Clicks

With the `GTM Attribute` variable created above and our [general strategy](#triggers-and-tags) in mind, let's set up a basic click event. This will create a new trigger and tag specific to this click event.

- Create a new trigger of type `Click - All Elements`. Trigger it to fire on `Some Clicks` and set a single condition of `GTM Attribute equals home-page-cta`. Name it `Home Page CTA Clicked`.
- Create a new tag of type `Google Analytics` with `Track Type` set to `Event`. At the bottom set `Google Analytics Settings` to `{{Google Analytics ID}}` and the trigger to `Home Page CTA Clicked` created above. Name this the same name as the trigger, `Home Page CTA Clicked`.
- Remember to publish the container before testing.

Inside the tag created above we can set the exact category, action, label and value we need. These can be hard coded strings or values pulled out with custom variables. For example if just the element text is needed, using the `{{GTM Attribute}}` variable we already set up will extract the element text. Other [custom variables](#variables) can also be set up.

### Element Visibility

GTM offers an advanced form of element visiblity tracking out of the box. Setup is similar to click tracking:

- Create a new trigger of type `Element Visibility`.
- Set the `Selection Method` to `CSS Selector`.
- Set the `Element Selector` to `[data-gtm="home-page-cta"]`.
- Set `When to fire this trigger` to `Once per element`.
- Other options can be set here like `Minimum Percent Visible` or `Minimum on-screen duration`.
- Name it `Home Page CTA Viewed` and save.
- Create a new tag of type `Google Analytics` with `Track Type` set to `Event`. At the bottom set `Google Analytics Settings` to `{{Google Analytics ID}}` and the trigger to `Home Page CTA Viewed` create above. Name this the same name as the trigger, `Home Page CTA Viewed`.
- Remember to publish the container before testing.

**Note**: This assumes a hook in the deployed code `<button data-gtm="home-page-cta">`. If this hook does not exist any CSS selector can be used as long as it uniquely identifies the element.

**Note**: Setting `Once per element` assumes that the event should fire **once** and only once when the element appears. In the context of a SPA this is typically what you want. Setting this to `Every time the element appears on screen` will fire the event if the element is scrolled out of view and re-appears.

### Other Interactions

GTM offers many other useful events such as `Scroll Depth` that can be set up similar to the above. However keep in mind that it is generally assuming a traditional web app, so events such as `Form Submission` and `Page View` typically don't apply.

## Data Events

In addition to pageview and interaction events, Bedrock also leverages its structure to provide data based events. In contrast to the question "what action did the user take?", these events attempt answer the question "what happened as a result?".

For example, a click interaction event on the "Create Account" button is a useful indicator of the user's intent, however it doesn't actually answer the question "was an account created?", as the user may encouter an error or their connection may get cut off. Data events attempt to more accurately answer these questions.

### Request Events

Request events are fired on every successful interaction with the API. They are implemented via the GTM `dataLayer` and contain useful information about the `request` and it's resulting `response`. Let's set one up:

Setup:

- To start using request events, create two new custom variables of type `Data Layer Variable` called `Request Method` and `Request Path`. Set these to `request.method` and `request.path` respectively.

Create new request event:

- Create a new trigger of type `Custom Event` and set the `Event name` to `request`.
- Trigger it to fire on `Some Custom Events`.
- Add a condition of `Request Method equals POST`.
- Add a condition of `Request Path equals /1/auth/register`.
- Name it `User Registered` and save.
- Create a new `Google Analytics` tag with the trigger set to `User Registered` created above.

The above tag and trigger will now fire on every **successful** `POST` request to `/1/auth/register`. This will ensure that the event will only fire when the actual user object was created.

**Note**: One very imporant thing to note is that Google Analytics does **not** allow tracking of sensitive information like user email, social security number, etc. Although data pushed into the data layer is still in the context of the browser and can be considered secure, if a trigger were to expose it, it would be pushed up.

Bedrock takes the extra step of stripping the entire request and response bodies unless specific fields are explicitly opted into. To do this update `PARAM_WHITELIST` in `services/web/src/utils/analytics/tracking.js`.

### Session Events

Session events are similar to request events but are triggered when data is added to the local session store.

Setup:

- Create two new custom variables of type `Data Layer Variable` called `Session Action` and `Session Key`. Set these to `action` and `key` respectively.

Create new session event:

- Create a new trigger of type `Custom Event` and set the `Event name` to `session`.
- Trigger it to fire on `Some Custom Events`.
- Add a condition of `Session Action equals add`.
- Add a condition of `Session Key equals location`.
- Name it `Location Stored` and save.
- Create a new `Google Analytics` tag with the trigger set to `Location Stored` created above.

The above tag and trigger will now fire when a location is added to the session store.

**Note**: Similar to request events, actual data stored will be stripped unless opted into. See above to add specific fields to the whitelist.

## User ID Tracking

GTM can push user IDs through to GA. Note that this has [implications](https://developers.google.com/analytics/devguides/collection/protocol/policy) that should be understood before using.

Setup:

- Uncomment the `setUserId` tracking code in `services/web/src/stores/session.js`.
- Create a new custom variable in GTM of type `Data Layer Variable` and set to `userId`. Name it `User ID`.
- In the `Google Analytics ID` custom variable edit `Fields to set` and add a field `userId` with a value of `{{User ID}}` set up above.
- Optionally add `{{User ID}}` to `Custom Dimensions` to further allow segmenation on user IDs.
- In Google Analytics Admin go to `Account Settings` > `Tracking Info` > `User-ID` follow the flow there to set up User ID tracking. Setting `Session Unification` to `ON` will allow user IDs to be retroactively applied to logged-out events after the users have successfully authenticated. Typically you want this on.

## Debugging

Debugging GTM can be tricky and setting up a tag/trigger wrong can fail silently. There are a few techniques that can make this easier.

1. Install the [Google Analytics Debugger](https://chrome.google.com/webstore/detail/google-analytics-debugger/jnkmfdileelhofjcijamephohjechhna?hl=en) extension which will show in the console exactly when a tag was fired.
2. Check the `dataLayer` in the console. This will tell you exactly what GTM sees and what you need to put in the `Data Layer Variable` fields.
3. When a tag isn't firing it often helps to loosen the trigger conditions and pass up the fields in the tag (category, action, label). Doing this will quickly pinpoint whether the issue is with the trigger or the variables.
