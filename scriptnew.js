window.onload = function()
{

	const canvasWidth = 900;
	const canvasHeight = 600;
	const blockSize = 30; /*taille du bloc mesure 30pixels sur 30 pixels*/
	const canvas = document.createElement('canvas');
	const ctx = canvas.getContext('2d');
	const widthInBlocks = canvasWidth/blockSize;
	const heightInBlocks = canvasHeight/blockSize;
	const centreX = canvasWidth / 2; // pour calculer ou est notre centre par rapport au Canvas pour l'affichage du score
	const centreY = canvasHeight / 2;
	let delay;
	let snakee; //nom du serpent, je crée la constiable et puis je l'ajoute dans la fonction "init"
	let applee;
	let score;
	let timeout;
	
	init();
	
	function init(){

		document.createElement('canvas');
		canvas.width = canvasWidth;
		canvas.height = canvasHeight;
		canvas.style.border = "30px solid gray";
		canvas.style.margin = "50px auto";
		canvas.style.display = "block";
		canvas.style.backgroundColor = "#ddd" ;
		document.body.appendChild(canvas);
		const ctx = canvas.getContext('2d');
		launch ();
	}
	
	function launch()// on va devoir tout re-créer
	{
		snakee = new Snake([[6,4], [5,4],[4,4],[3,4],[2,4]],"right");//tous ce qu'il y a entre parenthèse est notre body , /*le corps du serpent est un ensemble de petit blocs ex: ([[5,2],[2,6],[8,4]])*/
		applee = new Apple ([10,10]); // fonction constructeur qui ne prends qu'un seul bloc										/*corps du serpent dans des "Array" avec les 2 valeurs x et y*/
		score = 0;
		clearTimeout(timeout);
        delay = 100;
		refreshCanvas();	
	}
	
	function refreshCanvas(){
		snakee.advance();
		
		if(snakee.checkCollision()){
			gameOver();
		}else{
			if(snakee.isEatingApple(applee))//on vérifie si le serpent a bien mangé cete pomme-là en particulier
			{
				score++;
				snakee.ateApple = true;
				do{
					applee.setNewPosition();
				} while(applee.isOnSnake(snakee));
				
				if(score % 5 == 0){
					speedUp();
				}
			}
			ctx.clearRect(0,0, canvasWidth, canvasHeight);/*j'ai retiré les informations ici car je ne dessine plus un simple carré mais un serpent*/	
			drawScore();
			snakee.draw();/*pour pouvoir dessiner le serpent à chaque fois*/
			applee.draw(); //à chaque que on va refraichir notre page la pomme doit apparaitre
			timeout = setTimeout(refreshCanvas, delay);
		}
	}
	
	function speedUp(){
		delay /= 2;
	}
	
	function gameOver(){
		ctx.save(); //permet d'enregistrer les paramètres de configuration du Canvas
		ctx.font = "bold 70px sans-serif";
		ctx.fillstyle = "#000";
		ctx.textAlign = "center";
		ctx.textBaseline = "middle"; 
		ctx.strokeStyle = "white";
		ctx.lineWidth = 5;
		ctx.strokeText("Game Over",centreX, centreY - 180);
		ctx.fillText("Game Over",centreX, centreY - 180);
		ctx.font = "bold 30px sans-serif";
		ctx.strokeText("Appuyez sur la touche espace pour rejouer",centreX, centreY - 120);
		ctx.fillText("Appuyez sur la touche espace pour rejouer",centreX, centreY - 120);
		ctx.restore();
	}
	
	
	function drawScore()//va permettre d'afficher à l'écran le score
	{
		ctx.save(); //permet d'enregistrer les paramètres de configuration du Canvas
		ctx.font = "bold 200px sans-serif";
		ctx.fillstyle = "gray";
		ctx.textAlign = "center";
		ctx.textBaseline = "middle"; 
		ctx.fillText(score.toString(),centreX, centreY);
		ctx.restore();
	}
	
	function drawBlock(ctx, position)/*prends un contexte + une position d'un bloc*/
	{
		const x = position[0] * blockSize;// on va parler en pixel
		const y = position[1] * blockSize;
		ctx.fillRect(x, y , blockSize, blockSize);// on veut remplir un rectangle
	}
	
	
	function Snake(body, direction){
		this.body = body;
		this.direction = direction;
		this.ateApple = false;//pour vérifier que notre serpent a mangé une pomme
		this.draw = function()/*méthode*/
		{
			ctx.save();/*sauvegarder les éléments tels qu'ils sont avant d'entrer ds la fonction*/
			ctx.fillStyle = "#ff0000"; /*couleur du serpent*/
			for(let i = 0; i < this.body.length; i++)// création d'une boucle pour dessiner à l'écran mon serpent
			{											
				drawBlock (ctx, this.body[i]); //position du bloc du body (0,1 et 2 blocs attribués au serpent)
			}
			ctx.restore();
		};
		this.advance = function()
		{
			const nextPosition = this.body[0].slice();
			switch(this.direction)// qui va analyser notre direction
			{
				case "left":
					nextPosition[0] -= 1;
					break;
				case "right": 
				nextPosition[0] += 1;
					break;
				case "down":
				nextPosition[1] += 1;
					break;
				case "up":
					nextPosition[1] -= 1;
					break;
				default:
					throw("Invalid Direction");
			}
		
			this.body.unshift(nextPosition);
			if(!this.ateApple)
				this.body.pop();//suppression du dernier bloque au fur et à mesure de l'avancé de la tête du serpent
		else
			this.ateApple = false;
		};
		this.setDirection = function(newDirection)//on veut passer cette nouvelle direction au serpent
		{
			let allowedDirections;// ce sont les directions permises
			switch(this.direction){
				case "left":
				case "right": 
					allowedDirections = ["up", "down"];
					break;
				case "down":
				case "up":
					allowedDirections = ["left", "right"];	
					break;
				default:
				throw("Invalid Direction");
			}
			if(allowedDirections.indexOf(newDirection) > -1)// je veux changer ma direction que si cela est permis
			{
				this.direction = newDirection;
			}
		};
		this.checkCollision = function()//fonction vérifiant si le serpent sort du canvas ou si le serpent passe par-dessus son propre corps
		{
			let wallCollision = false;
			let snakeCollision = false;
			const head = this.body[0];//la tete du serpent
			const rest = this.body.slice(1);//le reste du corps du serpent
			const snakeX = head[0];// pour être plus précis on va détailler le X  et le Y de la tête
			const snakeY = head[1];
			const minX = 0;
			const minY = 0;
			const maxX = widthInBlocks - 1;
			const maxY = heightInBlocks - 1;
			const isNotBetweenHorizontalWalls = snakeX < minX || snakeX > maxX;
			const isNotBetweenVerticalWalls = snakeY < minY || snakeY > maxY;
			
			if(isNotBetweenHorizontalWalls || isNotBetweenVerticalWalls)
			{
				wallCollision = true;
			}
			for(let i = 0; i < rest.length; i++){
				if(snakeX === rest[i][0] && snakeY === rest[i][1]){
					snakeCollision = true;
				}
			}
			return wallCollision || snakeCollision;
		};
		this.isEatingApple = function(appleToEat)
		{
			const head = this.body[0];
			if(head[0] === appleToEat.position[0] && head[1] === appleToEat.position[1])
			{
				return true;
			}
			else
			{
				return false;
			}
		};
	}
	
	function Apple(position){
		this.position = position;
		this.draw = function(){
			const radius = blockSize/2;
			const x = this.position[0]*blockSize + radius;
			const y = this.position[1]*blockSize + radius;
			ctx.save();
			ctx.fillStyle = "#33cc33"; //couleur de notre pomme
			ctx.beginPath();
			
			ctx.arc(x,y, radius, 0, Math.PI*2, true);//fonction qui permet de dessiner un cercle
			ctx.fill();
			ctx.restore();
		};
		this.setNewPosition = function(){
			const newX = Math.round(Math.random() * (widthInBlocks - 1));//ceci donnera un chiffre entre "0" et "29"
			const newY = Math.round(Math.random() * (heightInBlocks - 1));
			this.position = [newX,newY];
		};
		this.isOnSnake = function(snakeToCheck){
			let inOnSnake = false;//constiable que l'on va retourner à la fin
			for(let i = 0; i < snakeToCheck.body.length; i++) //passage sur le corps du serpent avec une boucle
			{
				if(this.position[0] === snakeToCheck.body[i][0] && this.position[1] === snakeToCheck.body[i][1])
				{
					isOnSnake = true;
				}
			}
			return inOnSnake;
		};
	}
	
	document.onkeydown = function handleKeyDown(e)// quand l'utilisateur appuye sur une touche de son clavier
	{
		const key = e.keyCode; // code de la touche qui a été appuyé. 
		let newDirection;
		switch(key) // switch sur la touche qui a été appuyée
		{
			case 37:
				newDirection = "left";
				break;
			case 38:
				newDirection = "up";
				break;
			case 39:
				newDirection = "right";
				break;
			case 40:
				newDirection = "down";
				break;
				case 32:
				launch();
				return;
			default:
				return;
		}
		snakee.setDirection(newDirection);
		
	}
}





















