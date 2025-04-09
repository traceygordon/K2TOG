# K2TOG: 
General instructions for making edits: 
Clone the Repository using the SSH:
+ git clone [SSH Key Link]

Replace username and repository with the appropriate account and repository name.

You Can Check Your Remote Configuration Before Beginning: 
After cloning, it’s a good idea to verify that the remote URL is set up correctly:
From inside your repo (cd inside if necessary) use:
+ git remote -v

  You should see something like this, indicating that you are configured to use SSH:
  origin  git@github.com:username/repository.git (fetch)
  origin  git@github.com:username/repository.git (push)

Fetch and Sync with the Main Branch: 
Before you start making changes, it's good practice to fetch the latest changes from the remote repository and synchronize with the main branch. If you're using multiple branches, you might want to check out the branch you're supposed to work on:
+ git fetch origin
+ git checkout main (you can also just skip to this step if you want to be quick) 
+ git pull origin main (this pull can also be done from the source control panel) 

Create a New Branch for Your Changes:
When collaborating, it's best to create a separate branch for your changes. This helps keep your work organized and doesn't disrupt the main branch:
git checkout -b feature/my-feature (the -b can create a new branch, if you're not checking out an old branch)
Use a branch name that reflects the purpose of your work (e.g., feature/add-login, bugfix/fix-typo, etc.).

Make Your Changes:
Now, you can proceed to make your changes in the codebase.

Stage and Commit Your Changes:
After making your changes, you'll want to stage and commit them:
+ git add .
+ git commit -m "Add a brief description of your changes"

Push Your Changes to GitHub:
Once your changes are committed locally, push them to the remote repository. Make sure your new branch is pushed:
+ git push origin feature/my-feature (this push can also be done from the source control panel)

Open a Pull Request (PR):
After pushing your changes, navigate to the GitHub repository in your web browser. You should see an option to create a pull request with your newly pushed branch. Create a PR to initiate a review of your changes by your collaborators. You can also add details about your branch push.
After the request is made, you should be able to merge your branch.
Once your branch is merged, you can delete the branch for added cleanlyness/organization. 

Make sure when you go back to VS Code, you checkout the main branch again and pull down the new changes!

You can then checkout/make a new branch to add your next feature. 


MVP:
-


Possible Stretch Goals[Tier 1]:
-


Possible Stretch Goals[Tier 2]:
-
