export function DisplayDialouge(text, onDisplayEnd)
{
    const dialougeUI = document.getElementById("textbox-container");
    const dialouge = document.getElementById("dialouge");

    dialougeUI.style.display = "block";
    
    // Text scrolling
    let index = 0;
    let currentText = "";
    const intervalRef = setInterval(() => {
        if(index < text.length)
        {
            currentText += text[index];
            dialouge.innerHTML = currentText;
            index++;
            return;
        }

        clearInterval(intervalRef);
    }, 5);

    const closeBtn = document.getElementById("close");
    function onCloseBtnClick()
    {
        onDisplayEnd();
        dialougeUI.style.display = "none";
        dialouge.innerHTML = "";
        clearInterval(intervalRef);
        closeBtn.removeEventListener("click", onCloseBtnClick);
    }

    closeBtn.addEventListener("click", onCloseBtnClick);
}

export function setCamScale(k)
{
    const resizeFactor = k.width() / k.height();
    if(resizeFactor < 1)
    {
        k.camScale(k.vec2(1));
        return;
    }
    
    k.camScale(k.vec2(1.5));
}