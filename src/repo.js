async function getRepoIssues(context, owner, repo) {
    const getIssues = await context.github.issues.listForRepo({
      repo: repo,
      owner: owner,
    })
    return getIssues.data
  }
  
  async function getRepoLabels(context, owner, repo) {
    const getLabels = await context.github.issues.listLabelsForRepo({
      owner: owner,
      repo: repo,
      per_page: 100
    })
    return getLabels.data
  }

  async function addLabelIfNotExists (context, repoLabels, labelToAdd, owner, repo) {
    const exists = repoLabels.filter(
        function(label){ return label.name == labelToAdd.name }
    );
    if (exists.length == 0) {
        context.github.issues.createLabel({
        color: labelToAdd.color,
        name: labelToAdd.name,
        owner: owner,
        repo: repo
        })
    }
  }

  exports.getRepoIssues = getRepoIssues;
  exports.getRepoLabels = getRepoLabels;
  exports.addLabelIfNotExists = addLabelIfNotExists;
