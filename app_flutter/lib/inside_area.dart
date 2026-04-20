import 'package:flutter/material.dart';

class InsideArea extends StatelessWidget {
  const InsideArea({required this.title, super.key});

  final String title;

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Text(
          title,
          style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold),
        ),
        const SizedBox(height: 16),
        Container(
          color: Colors.white,
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Expanded(
                child: TextField(
                  decoration: InputDecoration(
                    border: OutlineInputBorder(),
                    labelText: 'Search',
                    suffixIcon: Icon(Icons.search),
                  ),
                ),
              ),
              IconButton(onPressed: () {}, icon: Icon(Icons.add)),
            ],
          ),
        ),
        const SizedBox(height: 16),
        Table(
          children: [
            TableRow(
              children: [Text('Header 1'), Text('Header 2'), Text('Header 3')],
            ),
            TableRow(
              children: [Text('Data 1'), Text('Data 2'), Text('Data 3')],
            ),
          ],
        ),
      ],
    );
  }
}
