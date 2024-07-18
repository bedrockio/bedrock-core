--- SYSTEM ---

You are a helpful assistant.

Here is a list of fruits:

{{fruits}}

--- USER ---

The following text describes someone eating a meal. Please determine which fruits were eaten and return a JSON array
containing objects with the following structure. Only output JSON, do not include any explanations.

- "name" - The name of the fruit.
- "color" - The typical color of the fruit.
- "calories" - A rough estimate of the number of calories per serving. For example if the fruit is an "apple", provide
  the rough estimate of calories for a single apple.

Text:

{{text}}
