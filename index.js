/**
 * This is the main entrypoint to your Probot app
 * @param {import('probot').Application} app
 */


module.exports = app => {
  
  app.log('Wow, amazing, eskworkflow was loaded!')

  app.on('project.created', async context => {
    const config = await context.config("eskworkflow.yaml");
    const tempParams = context.payload.project
    if (config.repo_project_workflow !== undefined){
      app.log("CONFIG", config.repo_project_workflow)
      projectName = config.repo_project_workflow[0].name
      if (projectName == tempParams.name) {
        config.repo_project_workflow[1].columns.forEach(column => {
          context.github.projects.createColumn({
            project_id: tempParams.id,
            name: column.column[0].name,
          })
        })
      }
    }
  })

  app.on('issues.labeled', async context => {
    const config = await context.config("eskworkflow.yaml");
    const tempParams = context.issue()
    // Handle workflow based on tagging
 
  })

  app.on('issues.opened', async context => {

    const config = await context.config("eskworkflow.yaml");
    app.log(config.auto_add_labels)
    const tempParams = context.issue()

    const getLabels = await context.github.issues.listLabelsForRepo({
      owner: tempParams.owner,
      repo: tempParams.repo,
      per_page: 100
    })
    const repoLabels = getLabels.data
    const auto_labels = []
    await config.auto_add_labels.forEach(auto_label => {

      app.log(auto_label)

      auto_labels.push(auto_label.name)
      app.log("Checking if exists:", auto_label.name)

      const exists = repoLabels.filter(
        function(label){ return label.name == auto_label.name }
      );
      if (exists.length == 0) {
        context.github.issues.createLabel({
          color: auto_label.color,
          name: auto_label.name,
          owner: tempParams.owner,
          repo: tempParams.repo
        })
      }

    });

    return context.github.issues.addLabels(
      {
        labels: auto_labels,
        owner: tempParams.owner,
        issue_number: tempParams.number,
        repo: tempParams.repo
      }
    )
     
  })

}
