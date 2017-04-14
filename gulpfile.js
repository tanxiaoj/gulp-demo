//导入工具包 require('node_modules里对应模块')
var gulp = require('gulp'), //本地安装gulp所用到的地方
    less = require('gulp-less'),
    minify = require('gulp-minify-css'),
    htmlmini = require('gulp-minify-html'),
    uglify = require('gulp-uglify'),
    concat = require("gulp-concat"),
    imagemin = require('gulp-imagemin'), //图片压缩
    pngquant = require('imagemin-pngquant'),
    imageminJpegRecompress = require('imagemin-jpeg-recompress'), //png图片压缩插件
    livereload = require('gulp-livereload'),
    connect = require('gulp-connect'),
    babel = require('gulp-babel'),
    postcss      = require('gulp-postcss'),
    sourcemaps   = require('gulp-sourcemaps'),
    autoprefixer = require('autoprefixer'),
    stripDebug = require('gulp-strip-debug'),
    rev = require('gulp-rev'), //- 对文件名加MD5后缀
    revCollector = require('gulp-rev-collector'); // 路径替换
//定义一个testLess任务（自定义任务名称）
gulp.task('lessfy', function () {
    gulp.src('src/less/*.less') //该任务针对的文件
    // “*”：匹配所有文件    例：src/*.js(包含src下的所有js文件)；
    // “**”：匹配0个或多个子文件夹    例：src/**/*.js(包含src的0个或多个子文件夹下的js文件)；
	// “{}”：匹配多个属性    例：src/{a,b}.js(包含a.js和b.js文件)  src/*.{jpg,png,gif}(src下的所有jpg/png/gif文件)；
	// “!”：排除文件    例：!src/a.js(不包含src下的a.js文件)；
        .pipe(less()) //该任务调用的模块
        .pipe(gulp.dest('src/css')) //将会在src/css下生成index.css
        .pipe(livereload());
        // .pipe(connect.reload());
});

//压缩 css
gulp.task('minify',function(){
    gulp.src(['src/css/*.css'])
        .pipe(minify())
        .pipe(gulp.dest('./dist/css'));	
});
//压缩 html
gulp.task('htmlmini', function () {
    gulp.src('src/*.html')
        .pipe(htmlmini())
        .pipe(gulp.dest('./dist'));
})

//压缩js
// 定义一个任务 compass
gulp.task('compass', function () {
    gulp.src(['src/js/*.js','!js/*.min.js'])  //获取文件，同时过滤掉.min.js文件
        .pipe(uglify())
        .pipe(gulp.dest('./dist/js'));  //输出文件
});

//文件合并
gulp.task('concat', function () {
    gulp.src('src/js/*.js')  //要合并的文件
    .pipe(concat('all.js'))  // 合并匹配到的js文件并命名为 "all.js"
    .pipe(gulp.dest('./dist/js'));
});

gulp.task('imagesmin', function () {
    return gulp.src('src/images/*')
        .pipe(imagemin({
            progressive: true,
            use: [pngquant(),imageminJpegRecompress()] //使用pngquant来压缩png图片
        }))
        .pipe(gulp.dest('./dist/images'));
});

gulp.task('watch', function() {
  	livereload.listen(); //要在这里调用listen()方法
  	gulp.watch('src/less/*.less', ['lessfy']);  //监听目录下的文件，若文件发生变化，则调用less任务。
});

gulp.task('webserver', function() {

    connect.server({
    	port :9000,
    	host :'gulp.dev',//在 hosts 文件中配置 gulp.dev 指向本机 IP 地址
    	livereload: true
    });

});

gulp.task('babel', () =>
    gulp.src('src/js/*.js')
        .pipe(babel({
            presets: ['env']
        }))
        .pipe(concat('all.js'))
        .pipe(uglify())
        .pipe(gulp.dest('dist/js'))
);

gulp.task('css', function () {

    return gulp.src('src/**/*.css')
        .pipe( sourcemaps.init() )
        .pipe( postcss([ require('precss'), require('autoprefixer') ]) )
        .pipe( sourcemaps.write('.') )
        .pipe( gulp.dest('./dist') );
})

//css 自动添加前缀
gulp.task('autoprefixer', function () {

  return gulp.src('src/**/*.css')
    .pipe(postcss([ autoprefixer({ browsers: ['last 999 versions'] }) ]))
    .pipe(gulp.dest('./dist'));
});

//除去javascript代码中的console,alert,debugger声明.
gulp.task('delconsole', function () {
    return gulp.src('src/**/*.js')
        .pipe(stripDebug())
        .pipe(gulp.dest('./dist'));
});

gulp.task('rev', function() {
    gulp.src('src/**/*.css')   
        .pipe(revCollector())              //- 执行文件内css名的替换
        .pipe(gulp.dest('./dist'));       //- 替换后的文件输出的目录
});

gulp.task('default',['webserver','babel','watch','lessfy','autoprefixer','minify','htmlmini','compass','concat','imagesmin']); //定义默认任务 elseTask为其他任务，该示例没有定义elseTask任务