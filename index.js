/**
 * This is the main entrypoint to your Probot app
 * @param {import('probot').Application} app
 */

const repoLib = require('./src/repo')
const projectLib = require('./src/project')

module.exports = app => {
  
  app.log('Eskworkflow was loaded!')

  app.on(['project.created', 'project.reopened'], async context => {

    const config = await context.config("eskworkflow.yaml");
    const tempParams = context.payload.project
    const owner = context.payload.repository.owner.login
    const repo = context.payload.repository.name

    if (config.repo_project_workflow === undefined){
      return
    }
    projectName = config.repo_project_workflow[0].name
    if (projectName != tempParams.name) {
      return
    }

    // Create labels if missing
    const repoLabels = await repoLib.getRepoLabels(context, owner, repo)
    var workflowLabels = await projectLib.getProjectWorkflowLabels(context)
    for (label of workflowLabels){
      repoLib.addLabelIfNotExists(context, repoLabels, label, owner, repo)
    }

    // Create columns
    for (column of config.repo_project_workflow[1].columns) {
      try {
        await context.github.projects.createColumn({
          project_id: tempParams.id,
          name: column.column[0].name,
        })
      } catch {
        app.log("COLUMN EXISTS")
      }
    }
    
    projectLib.moveIssuesToColumn(app, context, context.payload.project, owner, repo)
  })

  app.on('issues.labeled', async context => {

    const config = await context.config("eskworkflow.yaml");
    const tempParams = context.issue()
    const repoOpenProjects = await projectLib.getRepoOpenProjects(context, tempParams.owner, tempParams.repo)

    if (config.repo_project_workflow === undefined){
      return
    }

    // Remove any conflicting tag from config
    const setLabel = context.payload.label
    var foundLabel = null
    var workflowLabels = await projectLib.getProjectWorkflowLabels(context)
    const isWorkflowLabel = workflowLabels.filter(
      function(label){ return setLabel.name == label.name }
    );
    if (isWorkflowLabel.length != 0) {
      for (configLabel of workflowLabels) {
        if (configLabel.name != setLabel.name) {
          const exists = context.payload.issue.labels.filter(
            function(label){ return label.name == configLabel.name }
          );
          if (exists.length != 0) {
            // Delete the label that is already there
            await context.github.issues.removeLabel({
              owner: tempParams.owner,
              repo: tempParams.repo,
              name: configLabel.name,
              issue_number: tempParams.number,
            })
          }
        }
      }
    }

    // Handle workflow based on tagging
    for (const project of repoOpenProjects) {
      if (project.name === config.repo_project_workflow[0].name) {
        for (const column of config.repo_project_workflow[1].columns) {
          // Check if issue label belongs to a column, and move it there
          for (label of column.column[1].labels) {
            if (label.name == setLabel.name) {
              projectLib.moveOrCreateCard(app, context, project, context.payload.issue, column)
            }
          }
        }
      }
    }
  })

  app.on('issues.unlabeled', async context => {
    // TODO: Remove card from board if is a config Label
  })

  app.on('issues.opened', async context => {

    const config = await context.config("eskworkflow.yaml");
    const tempParams = context.issue()
    const repoLabels = await repoLib.getRepoLabels(context, tempParams.owner, tempParams.repo)
    
    const auto_labels = []

    // Add labels to repo if missing
    await config.auto_add_labels.forEach(auto_label => {
      auto_labels.push(auto_label.name)
      repoLib.addLabelIfNotExists(context, repoLabels, auto_label, tempParams.owner, tempParams.repo)
    });

    // Add labels to issue
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