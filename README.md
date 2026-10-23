# StudySprint

A focused study task list for organizing work, tracking progress, and keeping tasks between visits.

**Student:** [Dinah]

## Features

- Add tasks with input validation
- Complete, edit, and delete tasks
- Filter by All, Active, and Completed
- See the number of tasks left
- Clear completed tasks
- Save tasks and the selected filter between visits
- **Extra: Search tasks as you type**
- **Extra: Remember dark mode**

## User stories

- I can add a study task and get a helpful message if my input is invalid.
- I can mark a task complete or active, edit it, and delete it with confirmation.
- I can filter tasks and see how many are left.
- I can clear completed tasks.
- I can search as I type and get a message when there are no matches.
- My tasks, selected filter, and theme are remembered after a refresh.

## State shape

Each task is stored as an object:

```js
{
  id: "unique-id",
  text: "Review biology notes",
  completed: false
}