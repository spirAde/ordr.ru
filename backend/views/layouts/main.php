<?php
use yii\helpers\Html;
use yii\bootstrap\ActiveForm;

$this->beginPage() ?>

    <!doctype html>
    <html lang="ru" ng-app="controlApp">
    <head>

        <base href="/" />

        <meta charset="utf-8" />

        <title>control.ordr.ru</title>

        <?php $this->head() ?>

    </head>

    <body>

    <?php $this->beginBody() ?>

    <div class="site-login">
        <h1><?= Html::encode($this->title) ?></h1>

        <p>Please fill out the following fields to login:</p>

        <div class="row">
            <div class="col-lg-5">
                <?php $form = ActiveForm::begin(['id' => 'login-form']); ?>
                <?= Html::label('username','username') ?>
                <?= Html::textInput('username') ?>
                <br/>
                <?= Html::label('password','password') ?>
                <?= Html::passwordInput('password') ?>
                <div class="form-group">
                    <?= Html::submitButton('Login', ['class' => 'btn btn-primary', 'name' => 'login-button']) ?>
                </div>
                <?php ActiveForm::end(); ?>
            </div>
        </div>

    <?php $this->endBody() ?>

    </body>

    </html>

<?php $this->endPage() ?>