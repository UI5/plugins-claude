# Contributing to UI5 Claude Plugin

## Content

1. [📝 **Reporting Issues**](#-reporting-issues)
2. [🤩 **Feature Requests**](#-feature-requests)
3. [🔍 **Analyzing Issues**](#-analyzing-issues)
4. [💻 **Contributing Code**](#-contributing-code)

### ⚡️ Quick Links for Maintainers

- [All Open Pull Requests](https://github.com/UI5/claude-plugin/pulls)
- [All Open Issues](https://github.com/UI5/claude-plugin/issues)

## 📝 Reporting Issues

### Seeking Help / Not a Bug
If you need help setting something up, or if you have questions regarding UI5 Claude Plugin, please seek help on a community platform like [SAP Community](https://pages.community.sap.com/topics/ui5), [StackOverflow](http://stackoverflow.com/questions/tagged/ui5-renovate-config) or the `#renovate-config` channel of the [OpenUI5 Community Slack](https://ui5-slack-invite.cfapps.eu10.hana.ondemand.com/). -->

### How to Report an Issue

1. **Only UI5 Claude Plugin issues**
    * Please do not report:
        * Issues caused by dependencies.
        * Issues caused by the use of non-public/internal methods. Only the public methods listed in the API documentation may be used.
        * Something you do not get to work properly, see [Not a Bug / Questions](#not-a-bug--questions).
2. **No duplicate**: You have searched the [issue tracker](https://github.com/UI5/claude-plugin/issues?q=is%3Aissue+is%3Aopen+sort%3Aupdated-desc) to make sure the bug has not already been reported.
3. **Good summary**: The summary should be specific to the issue.
4. **Current bug**: The bug can be reproduced in the current version of the relevant module(s).
5. **Reproducible bug**: There are step-by-step instructions provided on how to reproduce the issue.
6. **Well-documented**:
    * Precisely state the expected and the actual behavior.
    * Give information about the environment in which the issue occurs (OS/Platform, Node.js version, etc.).
    * Generally, give as much additional information as possible.
7. **Only one bug per report**: Open additional tickets for additional issues.
8. **Please report bugs in English.**

We encourage you to follow the issue template that will be presented to you when creating a new issue.

When you are ready, report your issue here: https://github.com/UI5/claude-plugin/issues/new

### Reporting Security Issues

If you find any bug that may be a security problem, please follow the instructions given in [Security Policy](https://github.com/UI5/claude-plugin/security/policy) on how to report it. Please do not create GitHub issues for security-related concerns or problems.

### Use of Labels

GitHub offers labels to categorize issues. The labels can only be set and modified by committers.

#### General issue types:

- **`Bug`**: This issue is a bug in the code.
- **`Feature`**: This is not a bug report, but a feature request.

#### Specific issue categories for UI5 Claude Plugin:

- **`documentation`**: This issue is documentation-related.
- **`needs triage`**: This issue needs to be investigated and confirmed as a valid issue that is not a duplicate

##### Status of an open issue:

- **`information required`**: The author is required to provide more information.
- **`good first issue`**: A newcomer may work on this.
- **`help wanted`**: Additional help in analyzing this issue is required.

##### Status/resolution of a closed issue:

- **`duplicate`**: The issue has already been reported elsewhere.
- **`invalid`**: This issue report will not be handled further. Possible reasons are lack of information or an issue that does not arise anymore.
- **`wontfix`**: While we acknowledge the issue, a fix cannot or will not be provided.

### Issue Reporting Disclaimer

We would like to improve the quality of UI5 Claude Plugin and good bug reports are welcome! Since our capacity is limited, we cannot handle general questions or consultation requests, and we cannot always afford to ask for every relevant detail.

We therefore reserve the right to close or not to process insufficient bug reports in favor of those that are clearly documented and easy to reproduce. Even though we would like to resolve each well-documented issue, there's always a chance that it won't happen - please remember: UI5 Claude Plugin is open source and comes without warranty.

Bug report analysis support is always very welcome! See [Analyze Issues](#-analyzing-issues).

## 🤩 Feature Requests

You can request features by creating an issue in the UI5 Claude Plugin repository: https://github.com/UI5/claude-plugin/issues/new

For bigger features, an RFC (Request for Comment) might be necessary. You should always clarify the need for an RFC with the project contributors upfront. You could do this either by opening an issue or by posting in our [Slack channel](#seeking-help--not-a-bug). Use [this template](rfcs/0000-template.md) for creating an RFC.

## 🔍 Analyzing Issues

Analyzing issue reports can be a lot of effort. Any help is welcome! 👍

You may be able to add additional or missing information, such as a step-by-step guide on how to reproduce an issue or an analysis of the root cause. In case of the latter, you might even be able to [contribute](#-contributing-code) a bugfix. 🙌

## 💻 Contributing Code

### General Remarks

You are welcome to contribute code to UI5 Claude Plugin in order to fix bugs or to implement new features.

There are three important things to know:

1. You must be aware of the Apache License (which describes contributions) and **agree to the Developer Certificate of Origin (DCO)***. This is common practice in major open source projects. To make this process as simple as possible, we use *[CLA assistant](https://cla-assistant.io/)* for individual contributions. CLA assistant is an open source tool that integrates with GitHub very well and enables a one-click experience for accepting the DCO. For company contributors, special rules apply. See the respective section below for details.
2. Follow our **[Development Conventions and Guidelines](docs/Guidelines.md)**.
3. **Not all proposed contributions can be accepted**. Some features may just fit a third-party add-on better. The code must match the overall direction of UI5 Claude Plugin and improve it in a way to provide some "bang for the byte". For most bug fixes this is a given, but a major feature implementation first needs to be discussed with one of the committers; if possible, this should be someone who touched the related code or module recently. The more effort you invest, the better you should clarify in advance whether your contribution would match the project's direction. The best way would be to just open an enhancement ticket in the issue tracker to discuss the feature you plan to implement (make it clear that you intend to contribute). We will then forward the proposal to the respective code owner. This avoids disappointment.

### Developer Certificate of Origin (DCO)

For legal reasons, contributors will be asked to accept a DCO before they submit the first pull request to this project. SAP uses [the standard DCO text of the Linux Foundation](https://developercertificate.org/).  
This happens in an automated fashion during the submission process: the CLA assistant tool will add a comment to the pull request. Click it to check the DCO, then accept it on the following screen. CLA assistant will remember your decision for upcoming contributions.

This DCO replaces the previously used CLA ("Contributor License Agreement") as well as the "Corporate Contributor License Agreement" with new terms which are well-known standards and hence easier to approve by legal departments. Contributors who had already accepted the CLA in the past may be asked once to accept the new DCO.

### How to Contribute

1. Make sure the change is welcome (see [General Remarks](#general-remarks)).
1. Create a branch by forking the relevant module repository and apply your change.
1. Commit and push your change to that branch.
    - 👉 **Please follow our [Development Conventions and Guidelines](docs/Guidelines.md).**
1. Create a pull request in the relevant repository.
1. Follow the link posted by CLA assistant to your pull request and accept it as described above.
1. Wait for our code review and approval and enhance your change if requested to do so.
    - Note that UI5 developers have many duties. Depending on the required effort for reviewing, testing, and clarification, this step may take a while.
1. Once the change has been approved and merged, we will inform you in a comment.
1. Celebrate! 🎉

### Contributing with AI-generated code
As artificial intelligence evolves, AI-generated code is becoming valuable for many software projects, including open-source initiatives. While we recognize the potential benefits of incorporating AI-generated content into our open-source projects, there are certain requirements that need to be reflected and adhered to when making contributions.

Please see our [guideline for AI-generated code contributions to SAP Open Source Software Projects](https://github.com/UI5/.github/blob/main/CONTRIBUTING_USING_GENAI.md) for these requirements.
