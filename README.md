# Rugo Manage

Platform management tools.

## Concept

- The platform share their state named `context`.
- State is passed into a unit called `task`.
- All tasks running together in the `runner`.
- Runner is working with multiple steps called `phrase`.

### Context

- At the begining, it's an empty object.
- Be passed into each `task`, the context attribute (`register`) can be changed.
- Task can be retrived the before task's `register` for read or write.

### Phrases

- `starting`
- `started`
- `closing`
- `closed`

### Runner

- Runner start, the pharse move into `starting`. All task's `starting` hooks will be run.
- After all tasks done, the pharse move into `started`. All task's `started` hooks will be run.
- Runner close, the phrase move into `closing`. All task's `closing` hooks will be run.
- Ater all closed, the phrase move into `closed`. All task's `closed` hooks will be run.

### Task

- Task is defined with many hooks named as same as pharse name.

## Usage

### Define a new task

```js
const task = createTask({
  // attributes
  name: 'name of the task',

  // methods
  starting: async (context) { /* ... */ },
  started: async (context) { /* ... */ },
  closing: async (context) { /* ... */ },
  closed: async (context) { /* ... */ },
});
```

If any hooks is not defined, it's will be used the default empty function.

### Define a runner

```js
const runner = createRunner([
  taskA,
  taskB,
  taskC
]);
```

### Running

```js
await runner.start(); // return stats
await runner.close(); // return stats
```

Results:

- `runner.context` Context of runner.
- 
- `stats[name][phrase].status` State of phrase: `success`, `error`.
- `stats[name][phrase].duration` Duration to run that phrase.

### Exceptions

Each task can has it's own error and not effect to another tasks.

### Logging

- The runner will log task info.
- You can log anything you want in task's methods with `this.log("your-message")` function.

## API

[Visit API documentation.](./docs/API.md)

## License

MIT