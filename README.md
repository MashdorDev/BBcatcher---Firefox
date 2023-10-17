<div align="center">
<img style="align:center" src="icons/iconx128.png">
</div>

# BBcatcher: Your Academic Scheduler Browser Extension for Firefox

BBcatcher simplifies the life of students by seamlessly integrating their academic schedule within their browser. Whether it's exams, quizzes, or homework, BBcatcher ensures you're always ahead of your schedule. Initially crafted for Humber College's learning management system, it possesses the flexibility to adapt to other educational platforms with ease.

## Core Features

- **Automatic Calendar Integration**: Exams, quizzes, and homework are instantly added to your calendar.
- **Real-Time Notifications**: Stay updated with upcoming deadlines through timely notifications.
- **Google Calendar Synchronization**: Effortlessly syncs with Google Calendar to keep your schedule at your fingertips.
- **Adaptable to Various Learning Systems**: While tailored for Humber College, BBcatcher can be configured to work with other learning management systems.

## Quick Installation Guide

Getting BBcatcher up and running on your Firefox browser is a breeze. Just follow the outlined steps:

1. Navigate to the [BBcatcher's GitHub repository](https://github.com/BBcatcher/BBcatcher/releases) and download the latest release.
2. Unzip the downloaded files into a preferred directory on your machine.
3. Launch a terminal window and change the directory to where you've extracted the files.
4. Execute the command `npm install --global web-ext` to install `web-ext`.
5. To launch the extension, run the command: `web-ext run`.
6. Firefox will spring to life with BBcatcher extension installed and active.

> **Pro Tip**: For packaging the extension for distribution, leverage the `web-ext build` command in place of `web-ext run`. This will conjure a `.zip` file ready for distribution.

## How to Use BBcatcher <img style="align:center" src="icons/iconx16.png">

Harness the power of BBcatcher in a few easy steps:

1. Launch the Humber College learning management system on your browser.
2. Navigate to the desired course you wish to integrate with your calendar.
3. Click on the BBcatcher icon situated in your browser toolbar.
4. Hit the "Add to Calendar" button.
5. Select the calendar you wish to add the event to.
6. Click "Save" to finalize.

## Contribute to BBcatcher

Your ingenuity and code contributions are invaluable to BBcatcher's evolution. Here's a step-by-step guide on how you can contribute:

1. **Forking the Repository**:
   - Visit the [BBcatcher repository](https://github.com/BBcatcher/BBcatcher) on GitHub.
   - Click on the "Fork" button situated at the top right corner of the page. This action will create a copy of the repository under your GitHub account.

2. **Cloning Your Fork Locally**:
   - Open Git Bash on your machine.
   - Navigate to the directory where you want to clone the repository using the `cd` (change directory) command. For example: `cd /path/to/your/directory`.
   - Now clone your forked repository by executing the following command:
     ```bash
     git clone https://github.com/YOUR-USERNAME/BBcatcher---Firefox.git
     ```

3. **Creating a New Branch**:
   - Change to the repository's directory: `cd BBcatcher`.
   - Create a new branch for your changes, naming it descriptively:
     ```bash
     git checkout -b descriptive-branch-name
     ```

4. **Committing Your Changes**:
   - Make your desired changes in the code.
   - Once done, stage the changes by executing:
     ```bash
     git add .
     ```
   - Now, commit these staged changes with a meaningful message:
     ```bash
     git commit -m "A detailed message describing the essence of your changes"
     ```

5. **Pushing Changes to Your Fork**:
   - Push your committed changes to your fork on GitHub:
     ```bash
     git push origin descriptive-branch-name
     ```

6. **Initiating a Pull Request**:
   - Head back to your forked repository on GitHub.
   - Click on the "Pull requests" tab, followed by the "New pull request" button.
   - Ensure the base repository is set to `BBcatcher/BBcatcher` and the base branch is `main`. Your fork should be the compare repository and your descriptive branch name should be the compare branch.
   - Click on the "Create pull request" button, provide a detailed description of your changes, and submit your pull request for review.

Follow these steps diligently to ensure a smooth contribution process. Your efforts in enhancing BBcatcher are highly appreciated!

## License

BBcatcher is graciously made available under the MIT License. For more details, see [LICENSE](LICENSE).

## Explore BBcatcher on Chrome

For Chrome aficionados, BBcatcher has a sibling! Discover the [BBcatcher Chrome Extension](https://github.com/MashdorDev/BBcatcher---Chrome) and enjoy the same streamlined academic scheduling.

---

###### Crafted with ❤️ by the Dor Zairi <img style="align:center" src="icons/iconx16.png">

---

