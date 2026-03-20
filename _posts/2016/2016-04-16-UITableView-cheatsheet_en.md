---
layout: post
title: "UITableView Quick Reference"
description: ""
category: articles
tags: [iOS]
comments: true
---

## Properties


## DataSource Methods

```objc
#pragma mark - Returns the number of sections
- (NSInteger)numberOfSectionsInTableView:(UITableView *)tableView;

#pragma mark - Returns the number of rows in each section
- (NSInteger)tableView:(UITableView *)tableView numberOfRowsInSection:(NSInteger)section;

#pragma mark - Returns the cell for each row
- (UITableViewCell *)tableView:(UITableView *)tableView cellForRowAtIndexPath:(NSIndexPath *)indexPath;

#pragma mark - Returns the header title for each section
- (NSString *)tableView:(UITableView *)tableView titleForHeaderInSection:(NSInteger)section;

#pragma mark - Returns the footer text for each section
- (NSString *)tableView:(UITableView *)tableView titleForFooterInSection:(NSInteger)section;

#pragma mark - Returns the section index titles
- (NSArray *)sectionIndexTitlesForTableView:(UITableView *)tableView;
```

Execution order:

Calculate number of sections -> Calculate rows per section -> Generate section index -> Generate cells (all cells in all sections, in order)

## Delegate Methods

```
#pragma mark - Set the height of the section header
- (CGFloat)tableView:(UITableView *)tableView heightForHeaderInSection:(NSInteger)section;

#pragma mark - Set the height of each row (can vary per row)
- (CGFloat)tableView:(UITableView *)tableView heightForRowAtIndexPath:(NSIndexPath *)indexPath;

#pragma mark - Set the height of the section footer
- (CGFloat)tableView:(UITableView *)tableView heightForFooterInSection:(NSInteger)section;

#pragma mark - Row selection
- (void)tableView:(UITableView *)tableView didSelectRowAtIndexPath:(NSIndexPath *)indexPath;

#pragma mark - Editing mode
- (void)tableView:(UITableView *)tableView commitEditingStyle:(UITableViewCellEditingStyle)editingStyle forRowAtIndexPath:(NSIndexPath *)indexPath;

#pragma mark - Reordering
- (void)tableView:(UITableView *)tableView moveRowAtIndexPath:(NSIndexPath *)sourceIndexPath toIndexPath:(NSIndexPath *)destinationIndexPath;
```

## Reload Methods

```objc
// Reload the entire table view.
- (void)reloadData;

// Reload specific rows at the given index paths.
- (void)reloadRowsAtIndexPaths:(NSArray *)indexPaths withRowAnimation:(UITableViewRowAnimation)animation NS_AVAILABLE_IOS(3_0);

// Reload specific sections.
- (void)reloadSections:(NSIndexSet *)sections withRowAnimation:(UITableViewRowAnimation)animation NS_AVAILABLE_IOS(3_0);

// Delete rows at the specified index paths with animation.
- (void)deleteRowsAtIndexPaths:(NSArray *)indexPaths withRowAnimation:(UITableViewRowAnimation)animation;

// Insert rows at the specified index paths with animation.
- (void)insertRowsAtIndexPaths:(NSArray *)indexPaths withRowAnimation:(UITableViewRowAnimation)animation;
```


