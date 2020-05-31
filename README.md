# workflowbot

> A GitHub App built with [Probot](https://github.com/probot/probot) for team workflow made with Probot

# Configuration file

Create a directory `.github` in the root of your repo (if it doesn't exist) and add a file named `eskworkflow.yaml`.  

## Add automatic tags for new issues on the repo

Example:

```yaml
auto_add_labels: 
  - name: "New issue"
    color: "336699"
  - name: "Tada! :tada:"
    color: "663399"
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
      - labels:
        - name: "New issue"
          color: "336699"
    - column:
      - name: "To do"
      - labels:
        - name: "To do"
          color: "669933"
        - name: "Reopened issue"
          color: "339966"
    - column:
      - name: "In progress"
      - labels:
        - name: "In progress"
          color: "996633"
    - column:
      - name: "Done"
      - labels:
        - name: "Done"
          color: "993366"
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
