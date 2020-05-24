# workflowbot

> A GitHub App built with [Probot](https://github.com/probot/probot) for team workflow made with Probot

# Configuration file

Create a directory `.github` in the root of your repo (if it doesn't exist) and add a file named `eskworkflow.yaml`.  

## Add automatic tags for new issues on the repo

Example:

```yaml
auto_add_labels: 
  - name: "New issue"
    color: "aa3a4a"
  - name: "Tada! :tada:"
    color: "884599"
```

![Auto tagging](resources/img/AutoTagging.png)

# WIP: Automatic workflow on a project

Creating a repository project with the name that you specified on the config file, will automatically set columns and add/move issues to the column with the specified tag.

```yaml
repo_project_workflow:
  - name: "Some project"
  - columns:
    - column:
      - name: "New issue"
      - label: "New issue"
    - column:
      - name: "To do"
      - label: "To do"
    - column:
      - name: "In progress"
      - label: "In progress"
    - column:
      - name: "Done"
      - label: "Done"
```

## Project example

![Board](resources/img/Board.png)

## Issue labeling and automatic workflow

![Board](resources/img/LabelWorkflow.png)

## Contributing

If you have suggestions for how workflowbot could be improved, or want to report a bug, open an issue! We'd love all and any contributions.

For more, check out the [Contributing Guide](CONTRIBUTING.md).

## License

[ISC](LICENSE) © 2020 Samuel Jimenez <sjimenezre@gmail.com>
