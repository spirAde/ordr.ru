<?php

namespace console\controllers;
use Yii;
use yii\console\Controller;
use common\rbac\UserRoleRule;

class RbacController extends Controller {
    public function actionInit()     {

        $authManager = \Yii::$app->authManager;

        // Create roles
        $guest   = $authManager->createRole('guest');
        $manager = $authManager->createRole('manager');
        $admin   = $authManager->createRole('admin');

        // Create simple, based on action{$NAME} permissions
        $login  = $authManager->createPermission('login');
        $logout = $authManager->createPermission('logout');
        $error  = $authManager->createPermission('error');
        $signUp = $authManager->createPermission('sign-up');
        $index  = $authManager->createPermission('index');
        $view   = $authManager->createPermission('view');
        $update = $authManager->createPermission('update');
        $delete = $authManager->createPermission('delete');

        // Add permissions in Yii::$app->authManager
        $authManager->add($login);
        $authManager->add($logout);
        $authManager->add($error);
        $authManager->add($signUp);
        $authManager->add($index);
        $authManager->add($view);
        $authManager->add($update);
        $authManager->add($delete);

        $auth = Yii::$app->authManager;
        $auth->removeAll(); //remove previous rbac.php files under console/data

        //CREATE PERMISSIONS
        //Permission to create users
        $createUsers = $auth->createPermission('createUsers');
        $createUsers->description = 'Create Users';
        $auth->add($createUsers);

        //Permission to edit user profile
        $editUserProfile = $auth->createPermission('editUserProfile');
        $editUserProfile->description = 'Edit User Profile';
        $auth->add($editUserProfile);

        //APPLY THE RULE
        $rule = new UserRoleRule(); //Apply our Rule that use the user roles from user table
        $auth->add($rule);

        //ROLES AND PERMISSIONS
        //user role
        $guest = $auth->createRole('guest');  //user role
        $guest->ruleName = $rule->name;
        $auth->add($guest);
        // ... add permissions as children of $user ...
        //none in this example

        //editor role
        $manager = $auth->createRole('manager');
        $manager->ruleName = $rule->name;
        $auth->add($manager);
        // ... add permissions as children of $editor ..
        $auth->addChild($manager, $user); //user is a child of editor
        $auth->addChild($editor, $editUserProfile); //editor can edit profiles

        //Admin role
        $admin = $auth->createRole('admin');
        $admin->ruleName = $rule->name;
        $auth->add($admin);
        $auth->addChild($admin, $editor); //editor is child of admin, for consequence user is also child of admin
        // ... add permissions as children of $admin ..
        $auth->addChild($admin, $createUsers); //admin role can create users and also edit users because is parent of editor
    }
}