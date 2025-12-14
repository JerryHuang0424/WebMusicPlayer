//建立一个空数组用来存储音乐列表
var musicList = [];
var currentIndex = 0; //当前播放的音乐索引
var playState = false; //播放状态，默认未播放
let spectrumHideTimer = null;

//JS 知识点复习，var声明变量的时候可以重复声明，有函数作用域而不是块作用域
//let是现在推荐的声明变量发方法，不能重复声明同名变量，有块级作用域
//const是声明常量的，不能被修改，必须初始化

//页面打开的时候加载music.json文件
fetch('music.json')
  .then(res => res.json())
  .then(data => {
    console.log(data);
    musicList = data; //将获取到的音乐列表存储到musicList数组中
    render(musicList[currentIndex]); //调用渲染函数来显示音乐列表
    renderMusicList(musicList); //渲染音乐列表
  })
  .catch(err => console.error('加载失败:', err));

// 根据信息设置播放器内容
function render(data){
    //设置音乐名称
    document.querySelector(".name").textContent = data.name; 
    let singerAlbum = [data.singer, data.album].join(' - ');
    //设置歌手名称
    document.querySelector(".singer-album").textContent = singerAlbum; 
    document.querySelector(".cover img").src = data.cover;
    //设置音乐时长
    document.querySelector(".time").textContent = data.time; 
     //设置背景图片
    document.querySelector(".mask_bg").style.backgroundImage = `url(${data.cover})`;
    document.getElementById("audio-player").src = musicList[currentIndex].andio_url; //设置音频源
}

function renderMusicList(List) {
    const ul = document.querySelector('.music-list');
    ul.innerHTML = ''; // 清空旧内容

    const audio = document.getElementById('audio-player'); // 提前声明

    List.forEach((item, index) => {
        const li = document.createElement('li');
        li.className = index === currentIndex ? 'playing' : '';
        li.innerHTML = `
            <span>${String(index + 1).padStart(2, '0')}. ${item.name} - ${item.singer}</span>
            <span class="fas ${index === currentIndex && !audio.paused ? 'fa-pause-circle' : 'fa-play-circle'} play-btn" data-index="${index}"></span>
        `;
        ul.appendChild(li);
    });

    // 添加事件监听（保持原代码不变）
    document.querySelectorAll('.play-btn').forEach(btn => {
        btn.addEventListener('click', function (e) {
            e.stopPropagation();
            const index = parseInt(this.dataset.index);
            currentIndex = index;
            render(musicList[currentIndex]);
            PlayMusic(document.getElementById('playBtn'), true);
            renderMusicList(List);
        });
    });
}

function showSpectrum() {
    //快速点击两次播放按钮后，.player-spectrum（频谱）布局会“消失”的问题
    clearTimeout(spectrumHideTimer); // 取消之前的隐藏操作
    const spectrum = document.querySelector('.player-spectrum');
    spectrum.style.display = 'block';
    requestAnimationFrame(() => {
        spectrum.style.opacity = '1';
        spectrum.style.transform = 'scaleY(1)';
  });
}


function hideSpectrum() {
  const spectrum = document.querySelector('.player-spectrum');
  spectrum.style.opacity = '0';
  spectrum.style.transform = 'scaleY(0.8)';
  spectrumHideTimer = setTimeout(() => {
    spectrum.style.display = 'none';
  }, 500); // 这里把 timer 存起来
}


function updatePlayBtnIcons() {
    const audio = document.getElementById('audio-player');
    document.querySelectorAll('.play-btn').forEach((btn, index) => {
        if (index === currentIndex && !audio.paused) {
            btn.classList.remove('fa-play-circle');
            btn.classList.add('fa-pause-circle');
        } else {
            btn.classList.remove('fa-pause-circle');
            btn.classList.add('fa-play-circle');
        }
    });
}


function PlayMusic(triggerElement, forcePlay = false) {
    const audio = document.getElementById('audio-player');

    // 正常点击时翻转播放状态；如果是强制播放，就直接设为 true
    playState = forcePlay ? true : !playState;

    if (playState) {
        triggerElement.className = 'fas fa-pause';
        document.querySelector('.cover').style.animationPlayState = 'running';
        document.querySelector('.player-info').animate(
            [{ top: '0', opacity: 0 }, { top: '-100%', opacity: 1 }],
            { duration: 600, fill: 'forwards' }
        );
        audio.play();
        showSpectrum();
    } else {
        triggerElement.className = 'fas fa-play';
        document.querySelector('.cover').style.animationPlayState = 'paused';
        document.querySelector('.player-info').animate(
            [{ top: '-100%', opacity: 1 }, { top: '0', opacity: 0 }],
            { duration: 600, fill: 'forwards' }
        );
        audio.pause();
        hideSpectrum();
    }

     updatePlayBtnIcons();
}




document.getElementById('playBtn').addEventListener('click',function () {
    PlayMusic(this);
});

document.getElementById('playNext').addEventListener('click', function () {
    console.log('下一首按钮被点击了');
    //索引加1
    currentIndex++; 
    if (currentIndex >= musicList.length) {
        //如果超过了音乐列表长度，则回到第一首
        currentIndex = 0; 
    }
    //重新渲染播放器内容
    render(musicList[currentIndex]); 
    renderMusicList(musicList);
    if (playState) {
        //如果正在播放，切换后继续播放
        PlayMusic(document.getElementById('playBtn'), true);
    }
});

document.getElementById('playBack').addEventListener('click', function () {
    console.log('上一首按钮被点击了');
    currentIndex--; //索引减1
    if (currentIndex < 0) {
        //如果小于0，则回到最后一首
        currentIndex = musicList.length - 1; 
    }
    //重新渲染播放器内容
    render(musicList[currentIndex]); 
    renderMusicList(musicList);
    if (playState) {
        //如果正在播放，则切换为暂停状态
        PlayMusic(document.getElementById('playBtn'), true);
    }
});

document.getElementById('playList').addEventListener('click', function () {
    console.log('播放列表按钮被点击了');
    document.querySelector('.model').style.display = 'flex';
});

document.querySelector('.model-close').addEventListener('click', function () {
    console.log('关闭按钮被点击了');
    document.querySelector('.model').style.display = 'none';
    
});



function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    const formattedMins = String(mins).padStart(2, '0');  // 补0
    const formattedSecs = String(secs).padStart(2, '0');  // 补0
    return `${formattedMins}:${formattedSecs}`;
}

document.addEventListener('keydown', function (e) {
    const audio = document.getElementById('audio-player');

    switch (e.code) {
        case 'Space': // 空格键：播放 / 暂停
            e.preventDefault(); 
            PlayMusic(playBtn);
            break;

        case 'ArrowLeft': 
            if (e.ctrlKey || e.metaKey) {
                document.getElementById('playBack').click();
            } else {
                audio.currentTime = Math.max(0, audio.currentTime - 5);
            }
            break;

        case 'ArrowRight': 
            if (e.ctrlKey || e.metaKey) {
                document.getElementById('playNext').click();
            } else {
                audio.currentTime = Math.min(audio.duration, audio.currentTime + 5);
            }
            break;
        case 'Escape': // Esc 键：关闭播放列表
            if (document.querySelector('.model').style.display === 'flex') {
                document.querySelector('.model').style.display = 'none';
            }
            break;
    }
});


//监听音频播放时间更新进度条
document.getElementById('audio-player').addEventListener('timeupdate', function () {
    const currentTime = document.querySelector('.current-time');
    const audio = document.getElementById('audio-player');
    const progressBar = document.querySelector('.music_progress_line');
    //计算当前播放时间和总时长的比例
    const progress = (audio.currentTime / audio.duration) * 100; 
    //更新进度条宽度
    currentTime.textContent = formatTime(audio.currentTime); //更新当前时间显示
    progressBar.style.width = `${progress}%`; 
});