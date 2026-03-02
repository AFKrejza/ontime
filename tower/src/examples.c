#include <application.h>

void smug()
{
    	/* amogus:
	color: 0xFF00
	vectors:

	body outline:
		124, 28 =>
		124, 235 =>
		253, 235 =>
		253, 161 =>
		253,  28 =>
		215,  28 =>
		215,  62 =>
		162,  62 =>
		162,  28 =>
		124,  27

	face:
		186, 162 =>
		275, 162 =>
		275, 220 =>
		186, 220 =>
		186, 161

	backpack:
		123, 101 =>
		80, 101, =>
		80, 220 =>
		123, 220	
	*/

	const uint16_t RED = 0xF800;

	// body outline
	for (uint16_t y = 28; y <= 235; y++)
		draw_pixel(124, y, RED);
	for (uint16_t x = 124; x <= 253; x++)
		draw_pixel(x, 235, RED);
	// for (uint16_t y = 161; y <= 235; y++)
	// 	draw_pixel(253, y, RED);
	for (uint16_t y = 28; y <= 161; y++)
		draw_pixel(253, y, RED);
	for (uint16_t x = 215; x <= 253; x++)
		draw_pixel(x, 28, RED);
	for (uint16_t x = 162; x <= 215; x++)
		draw_pixel(x, 62, RED);
	for (uint16_t x = 125; x <= 162; x++)
		draw_pixel(x, 28, RED);
	for (uint16_t y = 27; y <= 28; y++)
		draw_pixel(124, y, RED);
	// face
	for (uint16_t x = 186; x <= 275; x++)
		draw_pixel(x, 162, RED);
	for (uint16_t y = 162; y <= 220; y++)
		draw_pixel(275, y, RED);
	for (uint16_t x = 186; x <= 275; x++)
		draw_pixel(x, 220, RED);
	for (uint16_t y = 161; y <= 220; y++)
		draw_pixel(186, y, RED);
	draw_pixel(186, 161, RED);
	// backpack
	for (uint16_t x = 80; x <= 123; x++)
		draw_pixel(x, 101, RED);
	for (uint16_t y = 101; y <= 220; y++)
		draw_pixel(80, y, RED);
	for (uint16_t x = 80; x <= 123; x++)
		draw_pixel(x, 220, RED);
	for (uint16_t y = 101; y <= 220; y++)
		draw_pixel(123, y, RED);
}