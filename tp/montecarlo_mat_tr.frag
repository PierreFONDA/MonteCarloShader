layout(location=20) uniform int nb_emissives;
layout(location=21) uniform int NB_BOUNCES;// nombre de rebonds du rayon

vec3 sample_hemisphere()
{
    float Z = random_float();
    float beta = acos(Z); // Angle par rapport au plan xy

    float alpha = random_float() * 2.0 * PI; // Angle azimutal

    // Conversion de coordonnées polaires à cartésiennes
    float x = sin(alpha) * sin(beta);
    float z = cos(beta);
    float y = cos(alpha) * sin(beta);

    return normalize(vec3(x, y, z));
}
vec3 random_ray(in vec3 D)
{
    // Choisir un vecteur W non colinéaire à D
    vec3 W = normalize(cross(D, vec3(1.0, 0.0, 1.0)));
    if (length(W) < 0.001) {
        W = normalize(cross(D, vec3(0.0, 1.0, 0.0)));
    }

    // Calculer U orthogonal à D et W
    vec3 U = normalize(cross(W, D));

    // Calculer V tel que U, V, D forment un repère orthonormé direct
    vec3 V = cross(D, U);

    // Mettre U, V, D dans une matrice de changement de repère
    mat3 M = mat3(U, V, D);

    // Multiplier votre échantillon par M pour bien l'orienter
    return M * sample_hemisphere();
}


vec3 random_path(in vec3 D, in vec3 O, int bounce)
{
    
    float intensity=0;
    traverse_all_bvh(O, D);
    vec3 N;
    vec3 P;
    intersection_info(N, P);
    vec4 colorbase = intersection_color_info();
	

    for(float i=0;(i<NB_BOUNCES);i++){

        traverse_all_bvh(O, D);
        //le rayon part dans le vide 
        if (!hit())
            return (colorbase.rgb*vec3(0.4, 0.4, 0.4));
        //si rayon touche
        vec3 N;
        vec3 P;
        intersection_info(N, P);
        vec4 mat = intersection_mat_info();
        vec4 col = intersection_color_info();
        colorbase=colorbase*col;
		vec3 Dirref=reflect(D,N);
            // Si emissivity > 0, c'est une source de lumière
        if (mat.b > 0.0) {
            return(colorbase.rgb*mat.b);//*(1/i));// j'ai enlever l'atténuation pour mieux voir les reflets
        }
      
		if(col.a>0.5){ //matériau opaque
			  
        	D=normalize(random_ray(N));
			D=mix(D,Dirref,(mat.g+mat.r)/2);//on change la direction des rayon pour les raprocher de notre reflect selon la rugosite
			P=P+0.001 * N;
		}
		else{
			//return(colorbase.rgb);
			D= refract(D, N , 1.03);//direction ,normal,indice refraction
			P=P+0.01 *(-N);
			traverse_all_bvh(P,D);
			intersection_info(N, P);
			P=P+0.001 * N;
    		D= refract(D, N , 1/1.03);
			}
		O=P;
    }
    return vec3(0) ;
    
}

vec3 raytrace(in vec3 Dir, in vec3 Orig)   
{
	// init de la graine du random
	srand();
	// calcul de la lumière captée par un chemin aléatoire
	return random_path(normalize(Dir),Orig,NB_BOUNCES);
}

	/*
		if(col.a>-12){ //matériau opaque
			D=mix(D,Dirref,(mat.g+mat.r)/2);//on change la direction des rayon pour les raprocher de notre reflect selon la rugosite
			P=P+0.001 * N;
		}
		else{
			return(colorbase.rgb*mat.b);
			D= refract(D, N , 1.03);//direction ,normal,indice refraction
			P=P+0.1 *(-N);
			traverse_all_bvh(P,D);
			intersection_info(N, P);
			vec4 color = intersection_color_info();
			P=P+0.001 * N;
    		D= refract(D, -N , 1/1.03);
			//return(mix(colorbase.rgb,color.rgb,col.a));}*/