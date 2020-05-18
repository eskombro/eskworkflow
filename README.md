# workflowbot

> A GitHub App built with [Probot](https://github.com/probot/probot) for team workflow made with Probot

# Configuration file

Create a directory `.github` in the root of your repo (if it doesn't exist) and add a file named `eskworkflow.yaml`.  

## Add automatic tags for new issues on the repo

Example:

```yaml
auto_add_labels: 
  - name: "Esk tag"
    color: "aa3a4a"
  - name: "Test tagging"
    color: "123a4a"
  - name: "Tada! :tada:"
    color: "884599"
```

## Contributing

If you have suggestions for how workflowbot could be improved, or want to report a bug, open an issue! We'd love all and any contributions.

For more, check out the [Contributing Guide](CONTRIBUTING.md).

## License

[ISC](LICENSE) © 2020 Samuel Jimenez <sjimenezre@gmail.com>
