<?php

namespace common\rbac;

use yii\rbac\Rule;

class UserRoleRule extends Rule {

    public $name = 'userRole';

    public function execute($user, $item, $params) {
        if (isset(\Yii::$app->user->identity->role))
            $role = \Yii::$app->user->identity->role;
        else
            return false;

        if ($item->name === 'admin') {
            return $role == 'admin';
        }
        elseif ($item->name === 'manager') {
            return $role == 'admin' || $role == 'manager'; //editor is a child of admin
        }
        elseif ($item->name === 'guest') {
            return $role == 'admin' || $role == 'manager' || $role == 'guest' || $role == NULL; //user is a child of editor and admin, if we have no role defined this is also the default role
        }
        else {
            return false;
        }
    }
}