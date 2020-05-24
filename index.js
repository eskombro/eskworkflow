/**
 * This is the main entrypoint to your Probot app
 * @param {import('probot').Application} app
 */


module.exports = app => {
  
  app.log('Wow, amazing, eskworkflow was loaded!')

  app.on(['project.created', 'project.reopened'], async context => {
    const config = await context.config("eskworkflow.yaml");
    const tempParams = context.payload.project

    const owner = context.payload.repository.owner.login
    const repo = context.payload.repository.name

    if (config.repo_project_workflow !== undefined){
      // If project name corresponds to the one in config, create workflow
      projectName = config.repo_project_workflow[0].name
      if (projectName == tempParams.name) {

        // Create labels
        const repoLabels = await getRepoLabels(context, owner, repo)
        var workflowLabels = []
        for (const column of config.repo_project_workflow[1].columns) {
          workflowLabels.push(column.column[1].label)
        }
        for (neededLabel of workflowLabels) {
          const exists = repoLabels.filter(
            function(label){ return label.name == neededLabel }
          );
          if (exists.length == 0) {
            context.github.issues.createLabel({
              color: '336699',
              name: neededLabel,
              owner: owner,
              repo: repo
            })
          }
        }

        // Create columns
        for (column of config.repo_project_workflow[1].columns) {
          await context.github.projects.createColumn({
            project_id: tempParams.id,
            name: column.column[0].name,
          })
        }

      }
      moveIssuesToColumn(context, context.payload.project, owner, repo)
    }
  })

  app.on('issues.labeled', async context => {


    const config = await context.config("eskworkflow.yaml");
    const tempParams = context.issue()
    const repoOpenProjects = await getRepoOpenProjects(context, tempParams.owner, tempParams.repo)

    // Remove any conflicting tag from other column
    const setLabel = context.payload.label
    if (config.repo_project_workflow !== undefined){
      var foundLabel = null
      var workflowLabels = []
      for (const column of config.repo_project_workflow[1].columns) {
        workflowLabels.push(column.column[1].label)
      }
      if (workflowLabels.includes(context.payload.label.name)) {
        app.log("IT'S CONTAINED")
        for (labelName of workflowLabels) {
          if (labelName != setLabel.name) {
            const exists = context.payload.issue.labels.filter(
              function(label){ return label.name == labelName }
            );
            if (exists.length != 0) {


              // Delete the label that is already there
              await context.github.issues.removeLabel({
                owner: tempParams.owner,
                repo: tempParams.repo,
                name: labelName,
                issue_number: tempParams.number,
              })

              // Delete the card from the project
              // for (const project of repoOpenProjects) {
              //   if (project.name === config.repo_project_workflow[0].name) {
              //     const projectColumns = await getProjectColumns(context, project)
              //     for (const col of projectColumns) {
              //       const columnCards = await getColumnCards(context, col)
              //       for (card of columnCards) {
              //         // app.log(card)
              //         if (card.content_url == context.payload.issue.url){

              //           await context.github.projects.moveCard({
              //             card_id: card.id,
              //             position: "top",
              //             column_id: col.id
              //           })
              //         }
              //       }
              //     }
              //   }
              // }

            }
          }
        }
      }
    }

    // Handle workflow based on tagging
    for (const project of repoOpenProjects) {
      if (project.name === config.repo_project_workflow[0].name) {
        moveIssuesToColumn(context, project, tempParams.owner, tempParams.repo)
      }
    }
  })

  app.on('issues.unlabeled', async context => {

  })

  app.on('issues.opened', async context => {

    const config = await context.config("eskworkflow.yaml");
    const tempParams = context.issue()

    const repoLabels = await getRepoLabels(context, tempParams.owner, tempParams.repo)
    const auto_labels = []
    await config.auto_add_labels.forEach(auto_label => {

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

  async function moveIssuesToColumn(context, project, owner, repo) {
    const repoIssues = await getRepoIssues(context, owner, repo)
    const config = await context.config("eskworkflow.yaml");
    // Iterate over issues
    for (const issue of repoIssues) {
      app.log("ISSUE:", issue.title)
      // Iterate over labels
      for (const label of issue.labels) {
        app.log("LABEL:", label.name)     
        // Iterate over columns in config file
        for (const column of config.repo_project_workflow[1].columns) {
          // Check if issue label belongs to a column, and move it there
          if (column.column[1].label == label.name) {
            app.log("Move issue " + issue.title + " to " + column.column[0].name)

            // Check if card exists

            var cardExists = null
            const projectColumns = await getProjectColumns(context, project)
            for (const col of projectColumns) {
              const columnCards = await getColumnCards(context, col)
              for (card of columnCards) {
                if (card.content_url == context.payload.issue.url){
                  // await context.github.projects.moveCard({
                  //   card_id: card.id,
                  //   position: "top",
                  //   column_id: col.id
                  // })
                  cardExists = card
                }
              }
            }

            for (const col of projectColumns) {
              if (col.name === column.column[0].name) {
                if (cardExists == null) {
                  await context.github.projects.createCard({
                    column_id: col.id,
                    content_id: issue.id,
                    content_type: "Issue",
                  })
                } else {
                  await context.github.projects.moveCard({
                    card_id: card.id,
                    position: "bottom",
                    column_id: col.id
                  })
                }
                
                break
              }
            }


            
          }
        }
      } 
    }
  }

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

  async function getRepoOpenProjects(context, owner, repo) {
    const getProjects = await context.github.projects.listForRepo({
      owner: owner,
      repo: repo,
      state: "open",
      per_page: 100
    })
    return getProjects.data
  }

  async function getProjectColumns(context, project) {
    const getColumns = await context.github.projects.listColumns({
      project_id: project.id,
    })
    return getColumns.data
  }

  async function getColumnCards(context, column) {
    const getCards = await context.github.projects.listCards({
      column_id: column.id,
    })
    return getCards.data
  }
}